import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate } from 'react-intl';
import Currency from './Currency';
import Link from './Link';
import Logo from './Logo';
import { get } from 'lodash';
import { firstSentence, imagePreview } from '../lib/utils';
import { defaultImage, defaultBackgroundImage } from '../constants/collectives';
import Container from './Container';
import StyledLink from './StyledLink';

class PledgedCollectiveCard extends React.Component {
  static propTypes = {
    collective: PropTypes.object.isRequired,
    membership: PropTypes.object,
    LoggedInUser: PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { collective, LoggedInUser } = this.props;

    const pledgeStats = collective.pledges.reduce(
      (stats, { totalAmount }) => {
        stats.backers++;
        stats.totalAmount += totalAmount;
        return stats;
      },
      {
        totalAmount: 0,
        backers: 0,
      },
    );

    let website = collective.website;
    if (!website && collective.githubHandle) {
      website = `https://github.com/${collective.githubHandle}`;
    }

    const truncatedDescription = 'Pledged Collective';
    const description = truncatedDescription;
    //   (collective.description && firstSentence(collective.description, 80)) ||
    //   (collective.longDescription && firstSentence(collective.longDescription, 80));
    // const description = collective.description;

    let route, params;
    if (collective.type === 'EVENT') {
      route = 'event';
      params = {
        parentCollectiveSlug: collective.parentCollective && collective.parentCollective.slug,
        eventSlug: collective.slug,
      };
    } else {
      route = 'collective';
      params = { slug: collective.slug };
    }

    if (LoggedInUser) {
      params.referral = LoggedInUser.CollectiveId;
    }

    return (
      <Link route={route} target="_top" params={params}>
        <div className={`PledgedCollectiveCard ${collective.type}`}>
          <style jsx>
            {`
              .PledgedCollectiveCard {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                cursor: pointer;
                vertical-align: top;
                position: relative;
                box-sizing: border-box;
                width: 200px;
                border-radius: 15px;
                background-color: #ffffff;
                box-shadow: 0 1px 3px 0 rgba(45, 77, 97, 0.2);
                overflow: hidden;
                text-decoration: none !important;
              }

              .head {
                position: relative;
                overflow: hidden;
                width: 100%;
                height: 14rem;
              }

              .logoBorder {
                height: 50%;
                border-bottom: 1px solid;
                border-color: black.200;
              }

              .logo {
                display: flex;
                height: 100%;
                align-items: center;
                justify-content: center;
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
              }

              .body {
                padding: 1rem;
                min-height: 11rem;
              }

              .name,
              .description,
              .website {
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .name {
                min-height: 20px;
                font-size: 14px;
                margin: 5px;
                font-weight: 700;
                text-align: center;
                color: #303233;
                white-space: nowrap;
              }

              .description {
                font-weight: bold;
                text-align: center;
                color: #787d80;
                font-size: 1rem;
                line-height: 1.3;
                margin: 5px;
                text-transform: uppercase;
              }

              .website {
                font-weight: normal;
                text-align: center;
                color: #0096f9;
                font-size: 1.2rem;
                line-height: 1.3;
                margin: 10px;
              }

              .makePledge {
                margin: 10px;
                text-align: center;
              }

              .claimCollective {
                margin: 10px;
                text-align: center;
              }

              .footer {
                font-size: 1.1rem;
                width: 100%;
                min-height: 6rem;
                text-align: center;
              }

              .membership,
              .stats,
              .totalDonations,
              .totalRaised {
                border-top: 1px solid #f2f2f2;
                padding: 1rem;
                color: #303233;
              }

              .stats {
                display: flex;
                width: 100%;
                box-sizing: border-box;
                justify-content: space-around;
              }

              .totalDonationsAmount,
              .totalRaisedAmount {
                font-size: 2rem;
              }

              .role {
                min-height: 13px;
                font-weight: 700;
                letter-spacing: 3px;
                color: #75cc1f;
                text-transform: uppercase;
              }

              .value,
              .label {
                text-align: center;
                margin: auto;
              }

              .value {
                font-weight: normal;
                text-align: center;
                color: #303233;
                font-size: 1.4rem;
                margin: 3px 2px 0px;
              }

              .label {
                font-size: 9px;
                text-align: center;
                font-weight: 300;
                color: #a8afb3;
                text-transform: uppercase;
              }

              .since {
                min-height: 18px;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.5;
                text-align: center;
                color: #aab0b3;
                text-transform: capitalize;
              }
            `}
          </style>
          <div className="head">
            <div className="logoBorder"></div>
            <div className="logo">
              <Logo src={collective.logo} type={collective.type} website={collective.website} height={65} />
            </div>
          </div>
          <div className="body">
            <div className="name">{collective.name}</div>
            <div className="description" title={description}>
              {truncatedDescription}
            </div>
            <div className="website">{website}</div>

            <div className="makePledge">
              <Link route="createCollectivePledge" params={{ slug: collective.slug }} passHref>
                <StyledLink textAlign="center" buttonStyle="primary" buttonSize="small">
                  <FormattedMessage id="menu.createPledge" defaultMessage="Make a Pledge" />
                </StyledLink>
              </Link>
            </div>

            <div className="claimCollective">
              <Link route="claimCollective" params={{ collectiveSlug: collective.slug }} passHref>
                <StyledLink textAlign="center" buttonSize="small" buttonStyle="standard">
                  <FormattedMessage id="pledge.claim" defaultMessage="Claim this collective" />
                </StyledLink>
              </Link>
            </div>
          </div>
          <div className="footer">
            {pledgeStats && (
              <div className="stats">
                <div className="yearlyBudget">
                  <div className="value">
                    <Currency value={pledgeStats.totalAmount} currency={collective.currency} />
                  </div>
                  <div className="label">
                    <FormattedMessage id="collective.card.stats.yearlyBudget" defaultMessage={'yearly budget'} />
                  </div>
                </div>
                <div className="backers">
                  <div className="value">{pledgeStats.backers}</div>
                  <div className="label">
                    <FormattedMessage
                      id="collective.card.stats.backers"
                      defaultMessage="{n, plural, one {backer} other {backers}}"
                      values={{ n: pledgeStats.backers }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
}

export default PledgedCollectiveCard;
