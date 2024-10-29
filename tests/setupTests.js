global.chrome = {
    tabs: {
      query: jest.fn().mockResolvedValue([{ id: 1, active: true, currentWindow: true }])
    }
};  