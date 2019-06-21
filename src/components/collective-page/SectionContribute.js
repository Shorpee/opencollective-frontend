import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { Box } from '@rebass/grid';
import memoizeOne from 'memoize-one';

import withIntl from '../../lib/withIntl';
import { H2 } from '../Text';
import StyledButton from '../StyledButton';
import Link from '../Link';

import { ContributionTypes } from './_constants';
import ContributeRow from './ContributeRow';
import ContainerSectionContent from './ContainerSectionContent';

/**
 * The contribute section, implemented as a pure component to avoid unnecessary
 * re-renders when scrolling.
 */
class SectionContribute extends React.PureComponent {
  static propTypes = {
    collective: PropTypes.shape({
      slug: PropTypes.string.isRequired,
      currency: PropTypes.string,
    }),
    tiers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        description: PropTypes.string,
        hasLongDescription: PropTypes.bool,
        interval: PropTypes.string,
        goal: PropTypes.number,
        stats: PropTypes.shape({
          totalRecurringDonations: PropTypes.number,
          totalDonated: PropTypes.number,
        }),
      }),
    ),
    events: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        description: PropTypes.string,
        image: PropTypes.string,
      }),
    ),
    intl: PropTypes.object,
  };

  static messages = defineMessages({
    customContribution: {
      id: 'CollectivePage.Contribute.Custom',
      defaultMessage: 'Custom contribution',
    },
    customContributionDetails: {
      id: 'CollectivePage.Contribute.Custom.Description',
      defaultMessage: 'Nothing there for you? Make a custom one time or recurring contribution.',
    },
  });

  static getContributionTypeFromTier(tier) {
    if (tier.goal) {
      return ContributionTypes.FINANCIAL_GOAL;
    }
    return tier.interval ? ContributionTypes.FINANCIAL_RECURRING : ContributionTypes.FINANCIAL_ONE_TIME;
  }

  static getWayToContributeFromTier(collective, tier) {
    const tierRoute = `/${collective.slug}/contribute/${tier.slug}-${tier.id}`;

    return {
      key: `tier-${tier.id}`,
      type: SectionContribute.getContributionTypeFromTier(tier),
      title: tier.name,
      contributeRoute: `${tierRoute}/checkout`,
      detailsRoute: tier.hasLongDescription ? tierRoute : null,
      description: tier.description,
      interval: tier.interval,
      goal: tier.goal,
      raised: tier.interval ? tier.stats.totalRecurringDonations : tier.stats.totalDonated,
      currency: tier.currency || collective.currency,
      amountType: tier.amountType,
      minAmount: tier.minimumAmount,
    };
  }

  static getWayToContributeFromEvent(collective, event) {
    return {
      key: `event-${event.id}`,
      type: ContributionTypes.EVENT_PARTICIPATE,
      title: event.name,
      contributeRoute: `/${collective.slug}/events/${event.slug}`,
      detailsRoute: `/${collective.slug}/events/${event.slug}`,
      description: event.description,
    };
  }

  /**
   * Takes a list of tiers and return an array like [financialContributions, moreWaysToContribute]
   * The returned contributions are properly formatted to be passed to `ContributeRow`.
   */
  getWaysToContribute = memoizeOne((collective, tiers, events) => {
    const { intl } = this.props;

    const financialContributions = [
      // Static way to contribute: /donate
      {
        key: 'donate',
        type: ContributionTypes.FINANCIAL_CUSTOM,
        title: intl.formatMessage(SectionContribute.messages.customContribution),
        description: intl.formatMessage(SectionContribute.messages.customContributionDetails),
        contributeRoute: `/${collective.slug}/donate`,
      },
      // Add tiers as ways to contribute
      ...(tiers || []).map(tier => {
        return SectionContribute.getWayToContributeFromTier(collective, tier);
      }),
    ];

    // Add events as ways to contribute
    const moreWaysToContribute = (events || []).map(event => {
      return SectionContribute.getWayToContributeFromEvent(collective, event);
    });

    return [financialContributions, moreWaysToContribute];
  });

  render() {
    const { intl, collective, tiers, events } = this.props;
    const [financialContributions, otherWaysToContribute] = this.getWaysToContribute(collective, tiers, events);

    return (
      <Box py={[null, null, 3]}>
        <ContainerSectionContent>
          <H2 mb={3} px={3} fontWeight="normal" color="black.900">
            <FormattedMessage id="CollectivePage.Contribute" defaultMessage="Contribute" />
          </H2>
        </ContainerSectionContent>
        <Box mb={4}>
          <ContributeRow
            contributionTypes={financialContributions}
            title={
              <FormattedMessage
                id="CollectivePage.FinancialContributor"
                defaultMessage="Become a financial contributor"
              />
            }
            intl={intl}
          />
        </Box>
        {otherWaysToContribute.length > 0 && (
          <ContributeRow
            contributionTypes={otherWaysToContribute}
            intl={intl}
            title={
              <FormattedMessage id="CollectivePage.MoreWaysToContribute" defaultMessage="More ways to contribute" />
            }
          />
        )}
        <ContainerSectionContent>
          <Link route="tiers" params={{ collectiveSlug: collective.slug, verb: 'contribute' }}>
            <StyledButton buttonSize="large" mt={3} width={1}>
              <FormattedMessage id="SectionContribute.All" defaultMessage="View all the ways to contribute" /> →
            </StyledButton>
          </Link>
        </ContainerSectionContent>
      </Box>
    );
  }
}

export default withIntl(SectionContribute);
