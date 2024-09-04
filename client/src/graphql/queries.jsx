import { gql } from '@apollo/client'

export const GET_USER = gql`
  query GetUser {
    getUser {
      user {
        _id
        email
        savedBooks {
          authors
          bookId
          description
          image
          link
          title
        }
        username
      }
    }
  }
`