const path = require("path");
const glob = require('glob-all');
const webpack = require("webpack");
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PurifyCSSPlugin = require('purifycss-webpack');


module.exports = {
	mode: "production",
	entry: [ "bootstrap-loader", "@babel/polyfill", path.resolve(__dirname, 'src', 'index.js')],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: "[name].[hash:8].js"
	},
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: 2,
				sourceMap: true,
				uglifyOptions: {
					compress: {
						inline: false
					},
					mangle : {
						reserved : ['$super', '$', 'exports', 'require', 'angular']
					}
				}
			})
		],
		nodeEnv: 'production',
		minimize: true,
		concatenateModules: true,
		runtimeChunk: true,
		splitChunks: {
			chunks: "all"
			/*cacheGroups: {
				default: false,
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendor_app",
					chunks: "all",
					minChunks: 2
				}
			}*/
		}
	},
	plugins: [
		new CleanWebpackPlugin('dist'),
		new MiniCssExtractPlugin({ filename: 'app.css' }),
        new webpack.ProvidePlugin({
			Collapse: "exports-loader?Collapse!bootstrap[\/\\]js[\/\\]dist[\/\\]collapse",
			Dropdown: "exports-loader?Dropdown!bootstrap[\/\\]js[\/\\]dist[\/\\]dropdown",
			Modal: "exports-loader?Modal!bootstrap[\/\\]js[\/\\]dist[\/\\]modal",
			Util: "exports-loader?Util!bootstrap[\/\\]js[\/\\]dist[\/\\]util"
		}),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production"),
				NODE_COMMAND: JSON.stringify("build")
			}
		}),
		new MomentLocalesPlugin({
            localesToKeep: ['es-la'],
        }),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "src", "index.pug"),
			inlineSource: 'runtime~.+\\.js'
		}),
		new InlineSourcePlugin(),
        new PurifyCSSPlugin({
            paths: glob.sync([
                path.join(__dirname, 'src/**/*.pug'),
                path.join(__dirname, 'src/**/*.html'),
                path.join(__dirname, 'src/**/*.js')
            ]),
            minimize: true,
            purifyOptions: {
                whitelist: ["table", "table-bordered", "collapsing", "niceWrapper", "toast-error", "toast-error", "toast-info", "toast-success", "toast-warning", "toast-message", "toast-message", "toast-top-right", "toast-title", "toast"]
            }
        })
	],
	module: {
		rules: [
			{
				test: require.resolve('jquery'),
				use: [{
					loader: 'expose-loader',
					options: 'jQuery'
				},{
					loader: 'expose-loader',
					options: '$'
				}]
			},
			{
				test: /\.html$/,
				loaders: [
					"html-loader"
				]
			},
			{
				test: /\.pug$/,
				loaders: [
					"html-loader", 
					"pug-html-loader"
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader : "ng-annotate-loader",
				
					},
					{
						loader: "babel-loader",
						options: {
							presets: [
								[
								"@babel/preset-env",
									{
										modules: "commonjs",
										targets: {
											browsers: "last 2 versions"
										}
									}
								]
							],
							plugins: ['@babel/plugin-proposal-object-rest-spread']
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader : "css-loader",
						options : {
							minimize : true
						}
					}
				]
			},
			{
				test: /\.scss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options : {
							minimize : true
						}
					},
					{
						loader: 'postcss-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			},
			{
				test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
				loader: 'url-loader',
				options: {
					limit: 10000
				}
			}
		]
	}
};