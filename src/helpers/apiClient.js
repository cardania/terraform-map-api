import fetch from 'node-fetch'
import pkg from '@apollo/client/core/core.cjs'
const { ApolloClient, HttpLink, InMemoryCache, gql } = pkg

export const CURRENT_EPOCH_QUERY = {
    query: gql`
        {
            cardano {
                currentEpoch {
                    number
                }
            }
        }
    `,
}

const client = new ApolloClient({
    link: new HttpLink({
        uri: `https://graphql-api.mainnet.dandelion.link`,
        fetch
    }),
    cache: new InMemoryCache()
})

export default client
