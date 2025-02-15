import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import themeGet from '@styled-system/theme-get';
import { Box, Flex } from '@rebass/grid';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { uniqBy, get } from 'lodash';

import { MoneyCheck } from 'styled-icons/fa-solid/MoneyCheck';
import { ExchangeAlt } from 'styled-icons/fa-solid/ExchangeAlt';

import { withStripeLoader } from './StripeProvider';
import Container from './Container';
import { P } from './Text';
import StyledCard from './StyledCard';
import StyledRadioList from './StyledRadioList';
import { getPaymentMethodName, paymentMethodExpiration } from '../lib/payment_method_label';
import withIntl from '../lib/withIntl';
import { formatCurrency } from '../lib/utils';

import CreditCard from './icons/CreditCard';
import GiftCard from './icons/GiftCard';
import PayPal from './icons/PayPal';
import CreditCardInactive from './icons/CreditCardInactive';
import Avatar from './Avatar';
import NewCreditCardForm from './NewCreditCardForm';

const PaymentEntryContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  background: ${themeGet('colors.white.full')};
  &:hover {
    background: ${themeGet('colors.black.50')};
  }
`;

const getPaymentMethodIcon = (pm, collective) => {
  if (pm.type === 'creditcard') {
    return <CreditCard />;
  } else if (pm.type === 'virtualcard') {
    return <GiftCard />;
  } else if (pm.service === 'paypal') {
    return <PayPal />;
  } else if (pm.type === 'prepaid') {
    return <MoneyCheck width="26px" height="18px" />;
  } else if (pm.type === 'collective' && collective) {
    const { image, type, name } = collective;
    return <Avatar src={image} type={type} size="3.6rem" name={name} />;
  } else if (pm.type === 'manual') {
    return <ExchangeAlt size="1.5em" color="#c9ced4" />;
  }
};

/** Returns payment method's subtitles */
const getPaymentMethodMetadata = pm => {
  if (pm.type === 'creditcard') {
    const expiryDate = paymentMethodExpiration(pm);
    return (
      <FormattedMessage
        id="ContributePayment.expiresOn"
        defaultMessage="Expires on {expiryDate}"
        values={{ expiryDate }}
      />
    );
  } else if (pm.type === 'virtualcard') {
    if (pm.expiryDate) {
      return (
        <FormattedMessage
          id="ContributePayment.balanceAndExpiry"
          defaultMessage="{balance} left, expires on {expiryDate}"
          values={{
            expiryDate: <FormattedDate value={pm.expiryDate} day="numeric" month="long" year="numeric" />,
            balance: formatCurrency(pm.balance, pm.currency),
          }}
        />
      );
    } else {
      return (
        <FormattedMessage
          id="ContributePayment.balanceLeft"
          defaultMessage="{balance} left"
          values={{ balance: formatCurrency(pm.balance, pm.currency) }}
        />
      );
    }
  } else if (['prepaid', 'collective'].includes(pm.type)) {
    return (
      <FormattedMessage
        id="ContributePayment.balanceLeft"
        defaultMessage="{balance} left"
        values={{ balance: formatCurrency(pm.balance, pm.currency) }}
      />
    );
  }
};

/**
 * A radio list to select a payment method.
 */
class ContributePayment extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.staticPaymentMethodsOptions = [
      {
        key: 'newCreditCard',
        title: <FormattedMessage id="contribute.newcreditcard" defaultMessage="New credit/debit card" />,
        icon: <CreditCardInactive />,
        paymentMethod: { type: 'creditcard', service: 'stripe' },
      },
    ];

    if (props.withPaypal) {
      this.staticPaymentMethodsOptions.push({
        key: 'paypal',
        title: 'PayPal',
        paymentMethod: { service: 'paypal', type: 'payment' },
        icon: getPaymentMethodIcon({ service: 'paypal', type: 'payment' }, props.collective),
      });
    }

    if (props.manual) {
      this.staticPaymentMethodsOptions.push({
        key: 'manual',
        title: props.manual.title || 'Bank transfer',
        paymentMethod: { type: 'manual' },
        icon: getPaymentMethodIcon({ type: 'manual' }, props.collective),
        data: props.manual,
      });
    }

    const paymentMethodsOptions = this.generatePaymentsOptions();
    this.state = {
      paymentMethodsOptions: paymentMethodsOptions,
      selectedOption: props.defaultValue || paymentMethodsOptions[0],
      newCreditCardInfo: null,
      save: true,
      errors: {},
    };
  }

  componentDidMount() {
    // We load stripe script as soon as the component mount
    this.props.loadStripe();

    // Generate an onChange event with default value on first mount if no default provided
    if (!this.props.defaultValue) {
      this.dispatchChangeEvent(this.state.selectedOption);
    }
  }

  dispatchChangeEvent(selectedOption, newCreditCardInfo, save) {
    if (this.props.onChange) {
      const isNew = selectedOption.key === 'newCreditCard';
      this.props.onChange({
        paymentMethod: selectedOption.paymentMethod,
        data: newCreditCardInfo,
        title: selectedOption.title,
        subtitle: selectedOption.subtitle,
        isNew,
        save,
        key: selectedOption.key,
        error: isNew && get(newCreditCardInfo, 'error'),
      });
    }
  }

  onChange(event) {
    const { name, value, checked } = event;
    this.setState(state => {
      const errors = state.errors;
      let selectedOption = state.selectedOption;
      let save = state.save;
      let newCreditCardInfo = state.newCreditCardInfo;

      if (name === 'PaymentMethod') {
        selectedOption = value;
      } else if (name === 'newCreditCardInfo') {
        newCreditCardInfo = value;
        if (value.error) {
          errors['newCreditCardInfo'] = value.error.message;
        } else {
          delete errors['newCreditCardInfo'];
        }
      } else if (name === 'save') {
        save = checked;
      }

      if (this.props.onChange) {
        this.dispatchChangeEvent(selectedOption, newCreditCardInfo, save);
      }

      return { ...state, selectedOption, save, errors };
    });
  }

  generatePaymentsOptions() {
    const { paymentMethods, collective, defaultValue } = this.props;
    const userPaymentMethods = uniqBy([...paymentMethods, ...get(collective, 'paymentMethods', [])], 'id');

    const paymentMethodsOptions = [
      ...userPaymentMethods.map(pm => ({
        key: `pm-${pm.id}`,
        title: getPaymentMethodName(pm),
        subtitle: getPaymentMethodMetadata(pm),
        icon: getPaymentMethodIcon(pm, collective),
        paymentMethod: pm,
      })),
      ...this.staticPaymentMethodsOptions,
    ];

    // Add default value to the list if it's a validated card
    if (defaultValue && defaultValue.isNew && defaultValue.key !== 'newCreditCard') {
      paymentMethodsOptions.unshift({
        ...defaultValue,
        title: (
          <FormattedMessage
            id="contribute.newCard"
            defaultMessage="New: {name}"
            values={{ name: getPaymentMethodName(defaultValue.paymentMethod) }}
          />
        ),
        subtitle: getPaymentMethodMetadata(defaultValue.paymentMethod),
        icon: getPaymentMethodIcon(defaultValue.paymentMethod, collective),
      });
    }

    return paymentMethodsOptions;
  }

  render() {
    const { paymentMethodsOptions, errors } = this.state;

    return (
      <StyledCard width={1} maxWidth={500} mx="auto">
        <StyledRadioList
          id="PaymentMethod"
          name="PaymentMethod"
          keyGetter="key"
          options={paymentMethodsOptions}
          onChange={this.onChange}
          defaultValue={this.state.selectedOption.key}
          disabled={this.props.disabled}
        >
          {({ radio, checked, index, value: { key, title, subtitle, icon, data } }) => (
            <PaymentEntryContainer
              px={[3, 24]}
              py={3}
              borderBottom={index !== paymentMethodsOptions.length - 1 ? '1px solid' : 'none'}
              bg="white.full"
              borderColor="black.200"
              cursor={this.props.disabled ? 'not-allowed' : 'pointer'}
            >
              <Flex alignItems="center">
                <Box as="span" mr={[2, 21]} flexWrap="wrap">
                  {radio}
                </Box>
                <Flex mr={3} css={{ flexBasis: '26px' }}>
                  {icon}
                </Flex>
                <Flex flexDirection="column">
                  <P fontWeight={subtitle ? 600 : 400} color="black.900">
                    {title}
                  </P>
                  {subtitle && (
                    <P fontSize="Caption" fontWeight={400} lineHeight="Caption" color="black.500">
                      {subtitle}
                    </P>
                  )}
                </Flex>
              </Flex>
              {key === 'newCreditCard' && checked && (
                <Box my={3}>
                  <NewCreditCardForm
                    name="newCreditCardInfo"
                    profileType={get(this.props.collective, 'type')}
                    error={errors.newCreditCardInfo}
                    onChange={this.onChange}
                    onReady={this.props.onNewCardFormReady}
                    hidePostalCode={this.props.hideCreditCardPostalCode}
                  />
                </Box>
              )}
              {key === 'manual' && checked && data.instructions && (
                <Box my={3} color="black.600" fontSize="Paragraph">
                  {data.instructions}
                </Box>
              )}
            </PaymentEntryContainer>
          )}
        </StyledRadioList>
      </StyledCard>
    );
  }
}

ContributePayment.propTypes = {
  /** The payment methods to display */
  paymentMethods: PropTypes.arrayOf(PropTypes.object),
  /**
   * An optional collective to get payment methods from. If used at the same time as
   * `paymentMethods` it will merge both lists and filter uniques using their ids.
   */
  collective: PropTypes.object,
  /** Called when the payment method changes */
  onChange: PropTypes.func,
  /**
   * Wether PayPal should be enabled. Note that this component does not render
   * PayPal button - this is up to parent component to do it.
   */
  withPaypal: PropTypes.bool,
  /** Manual payment method instruction. Should be null if an interval is set */
  manual: PropTypes.shape({ title: PropTypes.string, instructions: PropTypes.string }),
  /** Default value */
  defaultValue: PropTypes.object,
  /** Called with an object like {stripe} when new card form is mounted */
  onNewCardFormReady: PropTypes.func,
  /** From withStripeLoader */
  loadStripe: PropTypes.func.isRequired,
  /**
   * Wether we should ask for postal code in Credit Card form
   */
  hideCreditCardPostalCode: PropTypes.bool,
  /** If true, user won't be able to interact with the element */
  disabled: PropTypes.bool,
};

ContributePayment.defaultProps = {
  withPaypal: false,
  paymentMethods: [],
  collective: null,
  hideCreditCardPostalCode: false,
};

export default withIntl(withStripeLoader(ContributePayment));
