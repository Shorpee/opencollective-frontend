import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import styled from 'styled-components';
import { Flex, Box } from '@rebass/grid';
import { truncate } from 'lodash';

import { formatCurrency } from '../../lib/utils';
import Link from '../Link';
import StyledCard from '../StyledCard';
import StyledTag from '../StyledTag';
import { P, Span } from '../Text';
import StyledButton from '../StyledButton';
import FormattedMoneyAmount from '../FormattedMoneyAmount';
import StyledProgressBar from '../StyledProgressBar';

import { ContributionTypes } from './_constants';
import tierCardDefaultImage from './ContributeCardDefaultImage.svg';

/** The main container */
const StyledContributeCard = styled(StyledCard)`
  display: flex;
  flex-direction: column;
  width: 264px;
  flex: 0 0 264px;
  height: 100%;
`;

/** Tier card banner */
const CoverImage = styled.div`
  background-color: #f5f7fa;
  background-image: url(${tierCardDefaultImage});
  height: 135px;
  background-repeat: no-repeat;
  background-size: cover;
  padding: 16px;
`;

/** A tag to describe the type of contribution (one time, recurring...etc) */
const ContributionTypeTag = styled(StyledTag).attrs({
  color: 'primary.500',
  fontSize: 'Tiny',
  lineHeight: 'Tiny',
})`
  padding: 4px 8px;
  font-weight: bold;
  border: 1px solid #99cfff;
  border-radius: 100px;
  background: white;
`;

/** Translations */
const I18nContributionType = defineMessages({
  [ContributionTypes.FINANCIAL_CUSTOM]: {
    id: 'ContributionType.Custom',
    defaultMessage: 'Custom contribution',
  },
  [ContributionTypes.FINANCIAL_ONE_TIME]: {
    id: 'ContributionType.OneTime',
    defaultMessage: 'One time contribution',
  },
  [ContributionTypes.FINANCIAL_RECURRING]: {
    id: 'ContributionType.Recurring',
    defaultMessage: 'Recurring contribution',
  },
  [ContributionTypes.FINANCIAL_GOAL]: {
    id: 'ContributionType.Goal',
    defaultMessage: 'Goal',
  },
  [ContributionTypes.EVENT_PARTICIPATE]: {
    id: 'ContributionType.Event',
    defaultMessage: 'Event',
  },
});

const messages = defineMessages({
  fallbackDescription: {
    id: 'ContributeCard.Description.Fallback',
    defaultMessage:
      '{title, select, backer {Become a backer} sponsor {Become a sponsor} other {Join us}} {minAmount, select, 0 {} other {for {minAmountWithCurrency} {interval, select, month {per month} year {per year} other {}}}} and help us sustain our activities!',
  },
});

/**
 * A contribute card with a "Contribute" call to action
 */
const ContributeCard = ({ intl, contribution }) => {
  const { type, title, contributeRoute } = contribution;
  const { description, minAmount, interval, raised, goal, currency, detailsRoute } = contribution;
  let prettyDescription = description && truncate(description, { length: detailsRoute ? 60 : 256 });

  if (!prettyDescription) {
    prettyDescription = intl.formatMessage(messages.fallbackDescription, {
      title: title && title.toLowerCase(),
      interval,
      minAmount: minAmount || 0,
      minAmountWithCurrency: minAmount ? formatCurrency(minAmount, currency) : '',
    });
  }

  return (
    <StyledContributeCard>
      <CoverImage />
      <Flex px={3} py={3} flexDirection="column" justifyContent="space-between" flex="1">
        <div>
          <Box mb={2}>
            <ContributionTypeTag>{intl.formatMessage(I18nContributionType[type])}</ContributionTypeTag>
          </Box>
          {title && (
            <P fontSize="H5" mt={1} mb={3} fontWeight="bold" textTransform="capitalize">
              {title}
            </P>
          )}
          {goal && (
            <Box mb={3}>
              <P fontSize="Paragraph" color="black.500" mb={2}>
                <FormattedMessage
                  id="TierPage.AmountGoal"
                  defaultMessage="{amountWithInterval} goal"
                  values={{
                    amountWithInterval: (
                      <FormattedMoneyAmount
                        fontWeight="bold"
                        fontSize="H5"
                        color="black.900"
                        amount={goal}
                        interval={interval}
                        currency={currency}
                      />
                    ),
                  }}
                />
              </P>
              <P fontSize="Caption" color="black.500">
                <FormattedMessage
                  id="TierPage.AmountRaised"
                  defaultMessage="{amountWithInterval} raised"
                  values={{
                    amountWithInterval: (
                      <FormattedMoneyAmount fontWeight="bold" amount={raised} currency={currency} interval={interval} />
                    ),
                  }}
                />
                {goal && ` (${Math.round((raised / goal) * 100)}%)`}
              </P>
              <Box mt={1}>
                <StyledProgressBar percentage={raised / goal} />
              </Box>
            </Box>
          )}
          <P mb={4} mt={2}>
            {prettyDescription}{' '}
            {detailsRoute && (
              <Link route={detailsRoute}>
                <Span textTransform="capitalize">
                  <FormattedMessage id="ContributeCard.ReadMore" defaultMessage="Read more" />
                </Span>
              </Link>
            )}
          </P>
        </div>
        <Link route={contributeRoute}>
          <StyledButton width={1} mb={2} mt={3}>
            {goal ? (
              <FormattedMessage id="ContributeCard.BtnGoal" defaultMessage="Contribute with this goal" />
            ) : (
              <FormattedMessage id="ContributeCard.Btn" defaultMessage="Contribute" />
            )}
          </StyledButton>
        </Link>
      </Flex>
    </StyledContributeCard>
  );
};

ContributeCard.propTypes = {
  /** intl object */
  intl: PropTypes.object.isRequired,
  /** Defines the contribution */
  contribution: PropTypes.shape({
    /** Tier title */
    title: PropTypes.node.isRequired,
    /** Type of the contribution */
    type: PropTypes.oneOf(Object.values(ContributionTypes)).isRequired,
    /** Route for the contribute button */
    contributeRoute: PropTypes.string.isRequired,
    /** Route for the contribute button */
    detailsRoute: PropTypes.string,
    /** Description */
    description: PropTypes.node,
    /** Min amount in cents */
    minAmount: PropTypes.number,
    /** Defines if the amount is fixed or flexible */
    amounType: PropTypes.oneOf(['FIXED', 'FLEXIBLE']),
    /** Interval */
    interval: PropTypes.oneOf(['month', 'year']),
    /** Total amount raised in cents */
    raised: PropTypes.number,
    /** Goal in cents */
    goal: PropTypes.number,
    /** Currency */
    currency: PropTypes.string,
  }),
};

export default ContributeCard;
