import { ApolloClient, InMemoryCache, ApolloProvider, useSubscription, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { Container, Row, Col, FormInput, Button } from 'shards-react'
import { WebSocketLink } from '@apollo/client/link/ws'

import { GET_MESSAGES, POST_MESSAGE } from './queries';

const link = new WebSocketLink({
	uri: 'ws://localhost:4000/',
	options: {
		reconnect: true
	}
})

const client = new ApolloClient({
	link,
	uri: 'http://localhost:4000/',
	cache: new InMemoryCache()
});

const Messages = ({ user }) => {
	const { data } = useSubscription(GET_MESSAGES)
	if (!data) {
		return null
	} else {
		return (
			<div>
				{
					data.messages.map(({ user: messageUser, id, content }) => (
						<div key={id} style={{
							display: "flex",
							justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
							padding: "1em"
						}}>
							{
								user !== messageUser && (
									<div style={{
										height: 50,
										width: 50,
										marginRight: '0.5em',
										border: '2px solid #e5e6ea',
										borderRadius: 25,
										textAlign: 'center',
										fontSize: '18pt',
										paddingTop: 5,
									}}
									>
										{messageUser.slice(0, 2).toUpperCase()}
									</div>
								)
							}
							<div style={{
								background: user === messageUser ? '#58bf56' : '#e5e6ea',
								color: user === messageUser ? 'white' : 'balack',
								padding: "1em",
								borderRadius: "1em",
								maxWidth: "60%"
							}}>
								{content}
							</div>
						</div>
					))
				}
			</div>
		)
	}
}

const Chat = () => {
	const [state, setState] = useState({
		user: 'Julian',
		content: ''
	})
	const [postMessage] = useMutation(POST_MESSAGE)

	const onSend = () => {
		if (state.content.length > 0) {
			postMessage({
				variables: state,
			})
		}
		setState({ ...state, content: '' })

	}

	return (
		<Container>
			<Messages user={state.user} />
			<Row>
				<Col xs={2} style={{ padding: 0 }}>
					<FormInput
						label="User"
						value={state.user}
						onChange={(e) => setState({
							...state,
							user: e.target.value
						})}
					/>
				</Col>
				<Col xs={8}>
					<FormInput
						label="Content"
						value={state.content}
						onChange={(e) => setState({
							...state,
							content: e.target.value
						})}
						onKeyUp={(e) => { if (e.keyCode === 13) onSend() }}
					/>
				</Col>
				<Col xs={2} style={{ padding: 0 }}>
					<Button onClick={() => onSend()}>
						Send
					</Button>
				</Col>
			</Row>
		</Container>
	)
}

export default () => (
	<ApolloProvider client={client}>
		<Chat />
	</ApolloProvider>
)