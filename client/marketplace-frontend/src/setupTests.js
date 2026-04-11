import '@testing-library/jest-dom';

if (!global.TextEncoder) {
  global.TextEncoder = require('util').TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = require('util').TextDecoder;
}

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    icon: () => ({}),
    Marker: {
      prototype: {
        options: {},
      },
    },
  },
}));

jest.mock('jspdf', () => jest.fn());
jest.mock('jspdf-autotable', () => jest.fn());