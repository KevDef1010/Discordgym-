export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  socketUrl: 'http://localhost:3000',
  socketNamespaces: {
    friends: '/friends',
    chat: '/chat'
  },
  // Support both test ports
  allowedOrigins: ['http://localhost:4200', 'http://localhost:4201']
};
