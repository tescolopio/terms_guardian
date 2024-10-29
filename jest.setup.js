// jest.setup.js
global.chrome = {
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
      },
    },
    storage: {
      local: {
        get: jest.fn((keys, callback) => callback({ key: 'value' })),
        set: jest.fn((items, callback) => callback()),
      },
    }}  