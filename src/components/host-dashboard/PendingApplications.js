import React from 'react';
import PropTypes from 'prop-types';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Flex, Box } from '@rebass/grid';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import { Check } from 'styled-icons/boxicons-regular/Check';
import { Github } from 'styled-icons/fa-brands/Github';

import withIntl from '../../lib/withIntl';
import { withUser } from '../UserProvider';
import Loading from '../Loading';
import StyledCard from '../StyledCard';
import { Span } from '../Text';
import Container from '../Container';
import LinkCollective from '../LinkCollective';
import StyledButton from '../StyledButton';
import StyledHr from '../StyledHr';
import ExternalLinkNewTab from '../ExternalLinkNewTab';
import Avatar from '../Avatar';
import MessageBox from '../MessageBox';

const GetPendingApplications = gql`
  query HostPendingApplications($hostCollectiveSlug: String!) {
    Collective(slug: $hostCollectiveSlug) {
      id
      slug
      name
      pending: collectives(isActive: false, isArchived: false, orderBy: createdAt, orderDirection: DESC) {
        collectives {
          id
          slug
          name
          githubHandle
          type
          isActive
        }
      }
    }
  }
`;

const ApproveCollectiveMutation = gql`
  mutation approveCollective($id: Int!) {
    approveCollective(id: $id) {
      id
      isActive
    }
  }
`;

class HostPendingApplications extends React.Component {
  static propTypes = {
    hostCollectiveSlug: PropTypes.string.isRequired,
  };

  renderPendingCollectives(data, loading) {
    if (loading) {
      return (
        <Box px={2} py={5}>
          <Loading />
        </Box>
      );
    }

    const pendingCollectives = get(data, 'Collective.pending.collectives', []);

    return (
      <Container
        display="flex"
        background="linear-gradient(180deg, #EBF4FF, #FFFFFF)"
        flexDirection="column"
        alignItems="center"
        px={2}
        py={5}
      >
        {pendingCollectives.length === 0 && (
          <MessageBox type="info" withIcon mb={5}>
            <FormattedMessage
              id="host.pending-applications.noPending"
              defaultMessage="No collective waiting for approval"
            />
          </MessageBox>
        )}

        {pendingCollectives.map(c => (
          <StyledCard
            key={c.id}
            width={1}
            maxWidth={400}
            p={3}
            mb={4}
            boxShadow="rgba(144, 144, 144, 0.25) 4px 4px 16px"
          >
            <Flex>
              <Avatar collective={c} mr={2} radius={42} />
              <Container pl={2} flex="1 1" borderLeft="1px solid #e8e8e8">
                <div>
                  <LinkCollective collective={c}>
                    <strong>{c.name}</strong> <small>({c.slug})</small>
                  </LinkCollective>
                </div>
                {c.githubHandle && (
                  <ExternalLinkNewTab href={`https://github.com/${c.githubHandle}`}>
                    <Github size="1em" />
                    <Span ml={1}>{c.githubHandle}</Span>
                  </ExternalLinkNewTab>
                )}
              </Container>
            </Flex>
            <StyledHr my={3} borderColor="black.200" />
            <Flex justifyContent="center">
              {c.isActive ? (
                <Box color="green.700">
                  <Check size={39} />
                </Box>
              ) : (
                <Mutation mutation={ApproveCollectiveMutation}>
                  {(approveCollective, { loading }) => (
                    <StyledButton loading={loading} onClick={() => approveCollective({ variables: { id: c.id } })}>
                      <FormattedMessage id="host.pending-applications.approve" defaultMessage="Approve" />
                    </StyledButton>
                  )}
                </Mutation>
              )}
            </Flex>
          </StyledCard>
        ))}
      </Container>
    );
  }

  render() {
    const { hostCollectiveSlug } = this.props;

    return (
      <Query query={GetPendingApplications} variables={{ hostCollectiveSlug }}>
        {({ loading, error, data }) =>
          !data || error ? (
            <MessageBox type="error" withIcon>
              {error.message}
            </MessageBox>
          ) : (
            this.renderPendingCollectives(data, loading)
          )
        }
      </Query>
    );
  }
}

export default withUser(withIntl(HostPendingApplications));
