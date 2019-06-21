import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Flex, Box } from '@rebass/grid';
import dynamic from 'next/dynamic';

import { H3, P } from '../Text';
import HTMLContent, { isEmptyValue } from '../HTMLContent';
import InlineEditField from '../InlineEditField';
import Container from '../Container';
import StyledButton from '../StyledButton';
import StyledCard from '../StyledCard';
import Link from '../Link';
import ContainerSectionContent from './ContainerSectionContent';

/**
 * The budget section. Shows the expenses, the latests transactions and some statistics
 * abut the global budget of the collective.
 */
const SectionBudget = ({ collective }) => {
  return (
    <ContainerSectionContent py={5}>
      <H3 mb={3} fontSize={['H4', 'H2']} fontWeight="normal" color="black.900">
        <FormattedMessage id="CollectivePage.SectionBudget.Title" defaultMessage="Latest transactions" />
      </H3>
      <P color="black.600" mb={4} maxWidth={830}>
        <FormattedMessage
          id="CollectivePage.SectionBudget.Description"
          defaultMessage="See how money openly circulates through {collectiveName}. All contributions and all expenses are published in our transparent public ledger. Learn who is donating, how much, where is that money going, submit expenses, get reinmbursed and more!"
          values={{ collectiveName: collective.name }}
        />
      </P>
      <Flex justifyContent="space-between">
        <StyledCard>
          <P fontSize="Tiny" textTransform="uppercase">
            <FormattedMessage id="CollectivePage.SectionBudget.Transactions" defaultMessage="Transactions" />
          </P>
        </StyledCard>
        <StyledCard display="flex" flexDirection={['column', 'row', 'column']}>
          <Box py={16} px={24}>
            <P fontSize="Tiny" textTransform="uppercase" color="black.700">
              <FormattedMessage id="CollectivePage.SectionBudget.Balance" defaultMessage="Today’s balance" />
            </P>
            <P fontSize="H5" mt={1} mb={3}>
              $0.00 USD
            </P>
            <StyledButton buttonSize="small" fontWeight="bold" py={2} px={3}>
              <FormattedMessage id="CollectivePage.SectionBudget.SubmitExpense" defaultMessage="Submit Expenses" /> →
            </StyledButton>
          </Box>
          <Container background="#F5F7FA" py={16} px={24}>
            <P fontSize="Tiny" textTransform="uppercase" color="black.700">
              <FormattedMessage id="CollectivePage.SectionBudget.Annual" defaultMessage="Estimated annual budget" />
            </P>
            <P fontSize="H5" mt={1}>
              ~ $0.00 USD
            </P>
          </Container>
        </StyledCard>
      </Flex>
      <Link route="transactions" params={{ collectiveSlug: collective.slug }}>
        <StyledButton buttonSize="large" mt={3} width={1}>
          <FormattedMessage id="CollectivePage.SectionBudget.ViewAll" defaultMessage="View all transactions" /> →
        </StyledButton>
      </Link>
    </ContainerSectionContent>
  );
};

SectionBudget.propTypes = {
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default SectionBudget;
