import { Configuration } from 'webpack';

const webpackBaseConfig: Configuration = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      },
    ],
  },
  node: {
    __filename: true,
    __dirname: true,
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json'],
  },
  externals: [
    /^@via-profit-services\/core$/,
    /^graphql$/,
    /^uuid$/,
    /^winston$/,
    /^winston-daily-rotate-file$/,
  ],
};

export default webpackBaseConfig;
