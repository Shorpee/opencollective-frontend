import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'next/router';
import withIntl from '../lib/withIntl';
import { Box, Flex } from '@rebass/grid';
import styled from 'styled-components';
import CollectiveCard from '../components/CollectiveCard';
import PledgedCollectiveCard from '../components/PledgedCollectiveCard';
import Container from '../components/Container';
import Page from '../components/Page';
import { H1, P } from '../components/Text';
import LoadingGrid from '../components/LoadingGrid';
import Pagination from '../components/Pagination';
import MessageBox from '../components/MessageBox';
import StyledSelect from '../components/StyledSelect';
import { Link } from '../server/pages';
import SearchForm from '../components/SearchForm';

const DiscoverPageDataQuery = gql`
  query DiscoverPageDataQuery($offset: Int, $tags: [String], $orderBy: CollectiveOrderField, $limit: Int) {
    allCollectiveTags
    allCollectives(
      type: COLLECTIVE
      orderBy: $orderBy
      orderDirection: DESC
      offset: $offset
      tags: $tags
      limit: $limit
    ) {
      limit
      offset
      total
      collectives {
        id
        backgroundImage
        currency
        description
        longDescription
        image
        name
        settings
        slug
        type
        website
        githubHandle
        stats {
          yearlyBudget
          backers {
            all
          }
        }
        isPledged
        memberOf {
          id
        }
        parentCollective {
          id
          slug
          settings
          backgroundImage
        }
        pledges: orders(status: PENDING) {
          id
          totalAmount
          currency
        }
      }
    }
  }
`;

const NavList = styled(Flex)`
  list-style: none;
  min-width: 20rem;
  text-align: right;
  align-items: center;
`;

const NavLinkContainer = styled(Box)`
  text-align: center;
`;
NavLinkContainer.defaultProps = {
  as: 'li',
  px: [1, 2, 3],
};

const NavLink = styled.a`
  color: #777777;
  font-size: 1.4rem;
`;

const SortSelect = styled(StyledSelect)`
  width: 256px;
`;

const SearchFormContainer = styled(Box)`
  max-width: 40rem;
  min-width: 10rem;
`;

// const prepareTags = tags => {
//   return ['all'].concat(tags.map(tag => tag.toLowerCase()).sort());
// };

const DiscoverPage = ({ router }) => {
  const { query } = router;

  const params = {
    offset: Number(query.offset) || 0,
    tags: !query.show || query.show === 'all' ? undefined : [query.show],
    orderBy: query.sort === 'newest' ? 'createdAt' : 'totalDonations',
    limit: 12,
  };

  const applyFilter = (name, value) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, offset: 0, [name]: value },
    });
  };

  const sortOptions = {
    totalDonations: 'Most Popular',
    newest: 'Newest',
  };

  const selectedSort = sortOptions[query.sort || 'totalDonations'];

  const handleSubmit = event => {
    const searchInput = event.target.elements.q;
    console.log(searchInput);
    //Router.pushRoute('search', { q: searchInput.value });
    //event.preventDefault();
  };

  return (
    <Page title="Discover">
      {({ LoggedInUser }) => (
        <Query query={DiscoverPageDataQuery} variables={params}>
          {({ data, error, loading }) => (
            <Fragment>
              <Container
                alignItems="center"
                backgroundImage="url(/static/images/discover-bg.svg)"
                backgroundPosition="center top"
                backgroundSize="cover"
                backgroundRepeat="no-repeat"
                display="flex"
                flexDirection="column"
                height={328}
                justifyContent="center"
                textAlign="center"
              >
                <H1 color="white.full" fontSize={['H3', null, 'H2']} lineHeight={['H3', null, 'H2']}>
                  Discover awesome collectives to support
                </H1>
                <P color="white.full" fontSize="H4" lineHeight="H4" mt={4}>
                  Let&apos;s make great things together.
                </P>

                <Flex justifyContent="center" flex="1 1 1">
                  <SearchFormContainer p={2}>
                    <SearchForm placeholder="Search tag" onSubmit={handleSubmit} />
                  </SearchFormContainer>
                </Flex>
              </Container>
              <Container
                alignItems="center"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                maxWidth={1200}
                mx="auto"
                position="relative"
                px={2}
                top={80}
                width={1}
              >
                <Flex width={[1]} justifyContent="center" flexWrap="wrap">
                  <NavList as="ul" p={0} m={0} justifyContent="space-around" css="margin: 0;">
                    <NavLinkContainer>
                      <Link route="discover" passHref>
                        <NavLink>
                          <FormattedMessage id="discover.allCollectives" defaultMessage="All collectives" />
                        </NavLink>
                      </Link>
                    </NavLinkContainer>
                    <NavLinkContainer>
                      <Link route="marketing" params={{ pageSlug: 'how-it-works' }} passHref>
                        <NavLink>
                          <FormattedMessage
                            id="discover.openSourceCollectives"
                            defaultMessage="Open source collectives"
                          />
                        </NavLink>
                      </Link>
                    </NavLinkContainer>
                    <NavLinkContainer>
                      <NavLink href="/pricing">
                        <FormattedMessage id="discover.pledgedCollectives" defaultMessage="Pledged collectives" />
                      </NavLink>
                    </NavLinkContainer>
                    <NavLinkContainer>
                      <NavLink href="https://docs.opencollective.com">
                        <FormattedMessage id="discover.other" defaultMessage="Other" />
                      </NavLink>
                    </NavLinkContainer>
                  </NavList>

                  <Flex width={[1, null, 0.5]} justifyContent="flex-end" alignItems="center" mb={[3, null, 0]}>
                    <P as="label" htmlFor="sort" color="white.full" fontSize="LeadParagraph" pr={2}>
                      Sort By
                    </P>
                    <SortSelect
                      name="sort"
                      id="sort"
                      options={sortOptions}
                      defaultValue={selectedSort}
                      style={{ width: 256 }}
                      placeholder={'Sort by'}
                      onChange={selected => applyFilter('sort', selected.key)}
                    >
                      {({ value }) => <span style={{ display: 'flex', alignItems: 'flex-end' }}>{value}</span>}
                    </SortSelect>
                  </Flex>

                  {/* <Flex width={[1, null, 0.5]} justifyContent="center" alignItems="center">
                    <P as="label" htmlFor="show" color="white.full" fontSize="LeadParagraph" pr={2}>
                      Show
                    </P>
                    <select name="show" id="show" value={params.tags} onChange={onChange}>
                      {prepareTags(get(data, 'allCollectiveTags', [])).map(tag => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </Flex> */}
                </Flex>

                {loading && (
                  <Box pt={6}>
                    <LoadingGrid />
                  </Box>
                )}

                {error && (
                  <MessageBox type="error" withIcon mt={6}>
                    {error.message}
                  </MessageBox>
                )}

                {!error && !loading && data && data.allCollectives && (
                  <Fragment>
                    <Flex flexWrap="wrap" width={1} justifyContent="center">
                      {get(data, 'allCollectives.collectives', []).map(c => (
                        <Flex key={c.id} width={[1, 1 / 2, 1 / 4]} mb={3} justifyContent="center">
                          {c.isPledged ? (
                            <PledgedCollectiveCard collective={c} LoggedInUser={LoggedInUser} />
                          ) : (
                            <CollectiveCard collective={c} LoggedInUser={LoggedInUser} />
                          )}
                        </Flex>
                      ))}
                    </Flex>
                    {data.allCollectives.total > data.allCollectives.limit && (
                      <Flex justifyContent="center" mt={3}>
                        <Pagination
                          offset={data.allCollectives.offset}
                          total={data.allCollectives.total}
                          limit={data.allCollectives.limit}
                        />
                      </Flex>
                    )}
                  </Fragment>
                )}
              </Container>
            </Fragment>
          )}
        </Query>
      )}
    </Page>
  );
};

DiscoverPage.propTypes = {
  router: PropTypes.object,
};

export default withIntl(withRouter(DiscoverPage));
