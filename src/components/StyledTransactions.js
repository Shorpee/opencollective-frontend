import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import { Flex, Box } from '@rebass/grid';
import { FormattedMessage, FormattedDate, injectIntl } from 'react-intl';

import { formatCurrency } from '../lib/utils';
import Container from './Container';
import { P, Span } from './Text';
import DefinedTerm, { Terms } from './DefinedTerm';

/** Main container for the list of transactions */
const TransactionsContainer = styled.div`
  border: 1px solid #e6e8eb;
  border-radius: 8px 8px 0 0;

  & > div {
    position: relative;
    &:not(:last-child) {
      border-bottom: 1px solid #e6e8eb;
    }
  }
`;

/** A colored gradient to show the type of the transaction */
const TransactionTypeGradient = styled.div`
  position: absolute;
  right: -1px;
  height: 70%;
  width: 2px;
  margin: 14px 0;

  ${props =>
    props.transactionType === 'CREDIT'
      ? css`
          background: linear-gradient(
            180deg,
            #00af2f 0%,
            rgba(106, 255, 146, 0.354167) 53.65%,
            rgba(255, 255, 255, 0) 100%
          );
        `
      : css`
          background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffd4df 55.73%, #ff0044 100%);
        `}
`;

/**
 * A beautiful box to display transactions.
 */
const StyledTransactions = ({ transactions, collectiveCurrency, intl }) => {
  return (
    <TransactionsContainer>
      {transactions.map(transaction => (
        <div key={transaction.id}>
          <TransactionTypeGradient transactionType={transaction.type} />
          <Container p={24} display="flex" justifyContent="space-between">
            <Flex>
              <Box mr={3}>Avatar</Box>
              <Flex flexDirection="column" justifyContent="space-between">
                <P color="black.900" fontWeight="600">
                  {transaction.description}
                </P>
                <P color="black.500">
                  {transaction.usingVirtualCardFromCollective ? (
                    <FormattedMessage
                      id="Transactions.byWithGiftCard"
                      defaultMessage="by {collectiveName} with {collectiveGiftCardName} {giftCard} on {date}"
                      values={{
                        collectiveName: transaction.fromCollective.name,
                        date: <FormattedDate value={transaction.createdAt} day="short" month="long" year="numeric" />,
                        collectiveGiftCardName: transaction.usingVirtualCardFromCollective.name,
                        giftCard: <DefinedTerm term={Terms.GIFT_CARD} termTextTransform="lowercase" intl={intl} />,
                      }}
                    />
                  ) : (
                    <FormattedMessage
                      id="Transactions.by"
                      defaultMessage="by {collectiveName} on {date}"
                      values={{
                        collectiveName: transaction.fromCollective.name,
                        date: <FormattedDate value={transaction.createdAt} day="short" month="long" year="numeric" />,
                      }}
                    />
                  )}
                </P>
              </Flex>
            </Flex>
            <P fontSize="LeadParagraph">
              {transaction.type === 'CREDIT' ? (
                <Span color="green.700" mr={2}>
                  +
                </Span>
              ) : (
                <Span color="red.700" mr={2}>
                  −
                </Span>
              )}
              <Span fontWeight="bold" mr={1}>
                {formatCurrency(transaction.netAmountInCollectiveCurrency, collectiveCurrency)}
              </Span>
              <Span color="black.400" textTransform="uppercase">
                {collectiveCurrency}
              </Span>
            </P>
          </Container>
        </div>
      ))}
    </TransactionsContainer>
  );
};

StyledTransactions.propTypes = {
  /** The actual transactions */
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      netAmountInCollectiveCurrency: PropTypes.number,
      type: PropTypes.oneOf(['CREDIT', 'DEBIT']),
      usingVirtualCardFromCollective: PropTypes.shape({
        id: PropTypes.number,
        slug: PropTypes.string,
        name: PropTypes.string,
      }),
      fromCollective: PropTypes.shape({
        id: PropTypes.number,
        slug: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
  ).isRequired,

  /** Amount are displayed in collective currency, so we need this */
  collectiveCurrency: PropTypes.string.isRequired,

  /** from withIntl */
  intl: PropTypes.object,
};

export default injectIntl(StyledTransactions);
