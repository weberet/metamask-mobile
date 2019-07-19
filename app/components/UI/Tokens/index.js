import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Alert, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import ActionSheet from 'react-native-actionsheet';
import Engine from '../../../core/Engine';
import TokenElement from './TokenElement';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		minHeight: 500
	},
	emptyView: {
		backgroundColor: colors.white,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 50
	},
	text: {
		fontSize: 20,
		color: colors.fontTertiary,
		...fontStyles.normal
	},
	add: {
		margin: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	addText: {
		fontSize: 15,
		color: colors.blue,
		...fontStyles.normal
	},
	footer: {
		flex: 1,
		paddingBottom: 30
	}
});

const ethLogo = require('../../../images/eth-logo.png'); // eslint-disable-line

/**
 * View that renders a list of ERC-20 Tokens
 */
export default class Tokens extends PureComponent {
	static propTypes = {
		/**
		 * Navigation object required to push
		 * the Asset detail view
		 */
		navigation: PropTypes.object,
		/**
		 * Array of assets (in this case ERC20 tokens)
		 */
		tokens: PropTypes.array,
		/**
		 * Array of transactions
		 */
		transactions: PropTypes.array
	};

	actionSheet = null;

	tokenToRemove = null;

	renderEmpty = () => (
		<View style={styles.emptyView}>
			<Text style={styles.text}>{strings('wallet.no_tokens')}</Text>
		</View>
	);

	onItemPress = token => {
		this.props.navigation.navigate('Asset', { ...token, transactions: this.props.transactions });
	};

	renderFooter = () => (
		<View style={styles.footer} key={'tokens-footer'}>
			<TouchableOpacity style={styles.add} onPress={this.goToAddToken} testID={'add-token-button'}>
				<Icon name="plus" size={16} color={colors.blue} />
				<Text style={styles.addText}>{strings('wallet.add_tokens').toUpperCase()}</Text>
			</TouchableOpacity>
		</View>
	);

	renderItem = (asset, key) => (
		<TokenElement key={key} asset={asset} onPress={this.onItemPress} onLongPress={this.showRemoveMenu} />
	);

	renderList() {
		const { tokens } = this.props;

		return (
			<View>
				{tokens.map((item, i) => this.renderItem(item, i))}
				{this.renderFooter()}
			</View>
		);
	}

	goToAddToken = () => {
		this.props.navigation.push('AddAsset', { assetType: 'token' });
	};

	showRemoveMenu = token => {
		this.tokenToRemove = token;
		this.actionSheet.show();
	};

	removeToken = () => {
		const { AssetsController } = Engine.context;
		AssetsController.removeAndIgnoreToken(this.tokenToRemove.address);
		Alert.alert(strings('wallet.token_removed_title'), strings('wallet.token_removed_desc'));
	};

	createActionSheetRef = ref => {
		this.actionSheet = ref;
	};

	onActionSheetPress = index => (index === 0 ? this.removeToken() : null);

	render = () => {
		const { tokens } = this.props;
		return (
			<View style={styles.wrapper} testID={'tokens'}>
				{tokens && tokens.length ? this.renderList() : this.renderEmpty()}
				<ActionSheet
					ref={this.createActionSheetRef}
					title={strings('wallet.remove_token_title')}
					options={[strings('wallet.remove'), strings('wallet.cancel')]}
					cancelButtonIndex={1}
					destructiveButtonIndex={0}
					onPress={this.onActionSheetPress}
				/>
			</View>
		);
	};
}
