import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, Image } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import { connect } from 'react-redux';
import contractMap from 'eth-contract-metadata';
import FadeIn from 'react-native-fade-in-image';
import AssetElement from '../../AssetElement';
import TokenImage from '../../TokenImage';
import { renderFromTokenMinimalUnit, balanceToFiat } from '../../../../util/number';
import { toChecksumAddress } from 'ethereumjs-util';

const ethLogo = require('../../../../images/eth-logo.png'); // eslint-disable-line

const styles = StyleSheet.create({
	balances: {
		flex: 1,
		justifyContent: 'center'
	},
	balance: {
		fontSize: 16,
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	balanceFiat: {
		fontSize: 12,
		color: colors.fontSecondary,
		...fontStyles.normal
	},
	ethLogo: {
		width: 50,
		height: 50,
		overflow: 'hidden',
		marginRight: 20
	}
});

/**
 * Customizable view to render assets in lists
 */
class TokenElement extends PureComponent {
	static propTypes = {
		/**
		 * ETH to current currency conversion rate
		 */
		conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
		currentCurrency: PropTypes.string,
		/**
		 * Token balance of the asset
		 */
		tokenBalance: PropTypes.object,
		/**
		 * Token exchange rate of the asset
		 */
		tokenExchangeRate: PropTypes.number,
		/**
		 * Primary currency, either ETH or Fiat
		 */
		primaryCurrency: PropTypes.string,
		/**
		 * Token object
		 */
		asset: PropTypes.object,
		onPress: PropTypes.func,
		onLongPress: PropTypes.func
	};

	state = {
		mainBalance: undefined,
		secondaryBalance: undefined
	};

	componentDidMount() {
		this.calculateBalances();
	}

	calculateBalances() {
		const { conversionRate, currentCurrency, tokenBalance, tokenExchangeRate, primaryCurrency } = this.props;
		let asset = this.props.asset;
		const itemAddress = (asset.address && toChecksumAddress(asset.address)) || undefined;
		const logo = asset.logo || ((contractMap[itemAddress] && contractMap[itemAddress].logo) || undefined);
		const exchangeRate = tokenExchangeRate || undefined;
		const balance = asset.balance || renderFromTokenMinimalUnit(tokenBalance || 0, asset.decimals);
		const balanceFiat = asset.balanceFiat || balanceToFiat(balance, conversionRate, exchangeRate, currentCurrency);
		const balanceValue = balance + ' ' + asset.symbol;

		// render balances according to primary currency
		let mainBalance, secondaryBalance;
		if (primaryCurrency === 'ETH') {
			mainBalance = balanceValue;
			secondaryBalance = balanceFiat;
		} else {
			mainBalance = !balanceFiat ? balanceValue : balanceFiat;
			secondaryBalance = !balanceFiat ? balanceFiat : balanceValue;
		}

		asset = { ...asset, ...{ logo, balance, balanceFiat } };
		this.setState({ mainBalance, secondaryBalance });
	}

	componentDidUpdate() {
		this.calculateBalances();
	}

	render() {
		const { asset } = this.props;
		const { mainBalance, secondaryBalance } = this.state;
		return (
			<AssetElement
				key={asset.address || '0x'}
				onPress={this.props.onPress}
				onLongPress={this.props.onLongPress}
				asset={asset}
			>
				{asset.isETH ? (
					<FadeIn placeholderStyle={{ backgroundColor: colors.white }}>
						<Image source={ethLogo} style={styles.ethLogo} />
					</FadeIn>
				) : (
					<TokenImage asset={asset} containerStyle={styles.ethLogo} />
				)}

				<View style={styles.balances}>
					<Text style={styles.balance}>{mainBalance}</Text>
					{secondaryBalance ? <Text style={styles.balanceFiat}>{secondaryBalance}</Text> : null}
				</View>
			</AssetElement>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	primaryCurrency: state.settings.primaryCurrency,
	tokenBalance:
		ownProps.asset.address &&
		state.engine.backgroundState.TokenBalancesController.contractBalances[ownProps.asset.address],
	tokenExchangeRate:
		ownProps.asset.address &&
		state.engine.backgroundState.TokenRatesController.contractExchangeRates[ownProps.asset.address]
});

export default connect(mapStateToProps)(TokenElement);
