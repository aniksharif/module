import React, { Component } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableHighlight, Animated, Image,
    Platform, TouchableOpacity, FlatList,
    Dimensions, Picker,
    AsyncStorage,
    RefreshControl,
    Alert,
    TextInput,
    SafeAreaView


} from 'react-native';
import Config from './common/Config';
import { Modal as Modal1 } from 'react-native';
import Modal from "react-native-simple-modal";
import fontFamily from 'react-native-elements';
import SearchInput, { createFilter } from 'react-native-search-filter';
import Icon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import { marketStyles } from './common/styles';
import CheckBox from 'react-native-checkbox';
import { header, validateEmail, handleErrorCode } from './common/helper';
import Swipeout from 'react-native-swipeout';
import services from './common/services';
import SnackBar from 'react-native-snackbar-component';
import { ConnectivityRenderer } from 'react-native-offline';
//import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';
import { material } from 'react-native-typography';
import I18n from './i18n';
import moment from 'moment';

var { width, height } = Dimensions.get('window');
const KEYS_TO_FILTERS = ['token'];
const _coinList = [];
const sortingChkToken = false;
const sortingChkPrice = false;
const sortingChkVol = false;
const greyCurrency = ['USD', 'BTC', 'ETH']

let value = []
class _CheckBox extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            check: this.props.check,
            item: this.props.item,
            i: this.props.i
        }
        console.log("this.props:", this.props);
    }
    render() {
        const self = this;
        return (
            <CheckBox style={marketStyles.checkBox} label={""}
                checked={this.state.check}
                onChange={(checked) => {

                    this.setState({ check: !checked });
                    value.find(o => o.i === self.props.i) ? value[self.props.i] = { checked: !checked, item: self.props.item, i: self.props.i } : value.push({ checked: !checked, item: self.props.item, i: self.props.i });

                    console.log("my checked: ", checked, ", my value: ", value);
                }}
            />
        )
    }
}
export default class MarketScreen extends Config {
    Check = <Feather name='check' size={25} color='#707070' />;


    constructor(props) {
        super(props);

        this.state = {
            isConnected: true,

            addCoinButtonVisible: false,
            currency: "CAD",
            _authToken: '',
            _currentTabId: '',
            _currentTabName: '',
            _currentTokens: [],
            isLoading: false,
            exchangeLoading: false,
            ViewArray: [],
            Disable_Button: false,
            open: false,
            open1: false,
            toRemove: [],
            selectedTabIndex: 0,
            // selecetTabName: this.tabNames[0],
            searchTerm: '',
            listViewCHanged: true,
            tokenVisible: false,
            addCoinVisible: false,
            addExchangeVisible: false,
            pairSelected: 'USD',
            tabChange: false,
            exchangeValues: [],
            tabNames: [],
            coinList: [],
            search: [],
            exchangeList: [],
            tabToken: [],
            selectedindex: 0,
            showData: true,
            dataSource: [],
            sectionID: null,
            rowID: null,
            langValue: '',
            showDuplicateExchangeWarningModal: false,
            tabSuccess: false,
            tabRemove: false,
            deleted: '',
            refreshing: false,
            sorting: true,
            sorting1: false,
            sorting2: false,
            openGraphWarningModal: false,
            nameinputfocused: false,
            currencySign: '$',
            _greyCurrencySign: '$',
            _greyCurrencyPrint: 'usdPrice',
            _greyCurrency: 'USD',
            _greyCurrencyModal: false,
            _disabled: false,
            check: false

        }
        this.animatedValue = new Animated.Value(0);
        this.Array_Value_Index = 0;

        this.getLangValue = this.getLangValue.bind(this);
        this.getMarketTabs = this.getMarketTabs.bind(this);

        this.didMount = false;
        this.intervalId = -1;

    }

    //Modal Test
    modalDidOpen = () => console.log("Modal did open.");
    modalDidCloseGraph = () => {
        this.setState({ openGraphWarningModal: false });
    }
    modalDidClose = () => {
        this.setState({ open: false });
        console.log("Modal did close.");
    };
    modalDidClose1 = () => {
        this.setState({ open1: false });
        console.log("Modal did close.");
    };
    tabSuccessClose = () => {
        this.setState({ tabSuccess: false });
    }
    tabDeleteClose = () => {
        this.setState({ tabRemove: false });
    }
    moveUp = () => this.setState({ offset: -100 });
    resetPosition = () => this.setState({ offset: 0 });
    openModal = () => this.setState({ open: true });



    DuplicateExchangeModal = () => {
        return (
            <Modal
                open={this.state.showDuplicateExchangeWarningModal}
                offset={10}
                modalDidClose={() => this.setState({ showDuplicateExchangeWarningModal: false })}
                modalStyle={marketStyles.DuplicateExchangeModalStyle}
                overlayStyle={marketStyles.DuplicateExchangeModalOverlayStyle}

            >
                <View style={marketStyles.DuplicateExchangeModalMainView}>


                    <Image
                        source={require('../images/Failed.png')}
                        style={marketStyles.DuplicateExchangeModalImage}
                    />
                    <View style={marketStyles.DuplicateExchangeModalFailedView}>
                        <Text style={marketStyles.DuplicateExchangeModalFailedTxt}>{I18n.t("Failed!")}</Text>
                    </View>


                    <View style={marketStyles.DuplicateExchangeModalMassageView}>

                        <Text style={marketStyles.DuplicateExchangeModalMassage}>{this.state._message}</Text>
                    </View>
                    <View style={marketStyles.DuplicateExchangeModalOkView}>
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({ showDuplicateExchangeWarningModal: false, exchangeLoading: true });

                                this.sendSelected(this.state._currentTokens);
                            }}>
                            <Text style={marketStyles.DuplicateExchangeModalOk}>{I18n.t("OK")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
        );
    }


    createTab = async () => {
        const self = this;
        let tab;
        this.setState({ isLoading: true })
        var url = this.marketAPIBaseUrl + '/tabs';
        var payload = {
            "name": this.state._currentTabName,
            "tokens": [],
            "id": ""
        };

        var authtoken = await this.services._retrieveData("userToken");

        console.log("createTab = async () => {=>url: ", url);
        console.log("createTab = async () => {=>payload: ", payload);

        // TODO: Add proper popup rather than alert
        this.services._caller = self;
        this.services.postData(url, payload, authtoken)
            .then(function (_response) {
                console.log("createTab = async () => {=>_response: ", _response);

                if (_response.hasOwnProperty("error")) {
                    const _error = JSON.parse(_response.error);
                    if (_error.hasOwnProperty("code")) {
                        var text = handleErrorCode(_error.code);
                        console.log("text:", handleErrorCode(_error.code));
                        // self.DuplicateExchangeModal(text);
                        self.setState({ showDuplicateExchangeWarningModal: true, _message: text })


                    }
                    else if (_error.hasOwnProperty("message")) {
                        var text = _error.message;
                        self.setState({ showDuplicateExchangeWarningModal: true, _message: text })

                    }
                    else {
                        self.setState({ showDuplicateExchangeWarningModal: true, _message: "Unknown error occured!" })


                    }
                }
                else {

                    tab = JSON.parse(_response.data)
                    self.state.tabNames.push(tab);
                    var index = (self.state.tabNames).indexOf(tab);
                    // console.log("index: ", index);
                    self.setState({ selectedindex: index, _currentTokens: tab.tokens, _currentTabName: tab.name, _currentTabId: tab.id, addCoinButtonVisible: true, tabSuccess: true, exchangeLoading: false })
                    // console.log(" self.state.tabNames.splice(0: ", self.state.tabNames);
                    // alert(I18n.t("Successfully created tab '") + self.state._currentTabName + "'");
                }
                self.setState({ isLoading: false, open: false, tokenVisible: false })
            })
            .catch((_err) => {
                var text = _error.message;

                self.setState({ isLoading: false, open: false, showDuplicateExchangeWarningModal: true, _message: text })
            })


        this.setState({ open: true });

    }
    addTabView = () => {

    }
    // ListViewItemSeparator = () => {
    //     return (
    //         <View
    //             style={{
    //                 height: .5,
    //                 width: "100%",
    //                 backgroundColor: "#000"
    //             }}
    //         />
    //     );
    // }
    GetListViewItem(rowData) {
        this.setState({ selecetTabName: rowData });
    }
    GetTab = (item) => {
        return (
            <Text style={styles.tabStyle}>{item}</Text>
        );
    }

    _marketTabAsync = async (obj) => {
        //this.services._storeData('userToken', '');
        obj.props.navigation.navigate('PasswordChange');
    };


    //Coin list Evaluting

    searchUpdated(term) {
        var self = this
        self.setState({ searchTerm: term })
    }
    searchHeader() {
        let self = this;
        return (
            <SearchInput
                onChangeText={(term) => { self.searchUpdated(term) }}
                inputViewStyles={styles.searchInput}
                placeholder={I18n.t("Type a coin name to search")}
                fuzzy={true}
                inputFocus={true}
            />
        )
    }

    _renderModalAddCoin = () => {
        const self = this;

        // self.setState({ isLoading: false, requesting: false, });
        // console.log("_renderModalAddCoin = () => {=> self.state.coinList: ", self.state.coinList);


        const filterList = _coinList.length > 0 ? _coinList.filter(createFilter(self.state.searchTerm, KEYS_TO_FILTERS)) : _coinList;

        // <ScrollView>

        //     {filterList.map((item, i) =>
        //         (
        //             <TouchableOpacity key={i} style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
        //                 onPress={() => self.onSelectCoin(item.token)}>
        //                 <Text key={i}>{self.state.langValue === 'EN' || self.state.langValue === 'English' ?
        //                     item.token : item.token + "       " + item.chTokenName}
        //                 </Text>
        //             </TouchableOpacity>))}
        // </ScrollView>
        return (
            <View>
                <View style={marketStyles.renderModalAddCoinView}>
                    <View style={marketStyles.renderModalAddCoinIcon}>
                        <Feather name='search' size={26} color='#a2a2a2' />
                    </View>
                    <SearchInput
                        onChangeText={(term) => { self.searchUpdated(term) }}
                        style={styles.searchInput}
                        placeholder={I18n.t("Search")}
                    />
                </View>
                <View>
                    <FlatList
                        ref={ref => this.listRef = ref}
                        data={filterList}
                        //data={this.props.users}
                        //data={this.tabInfo}
                        ItemSeparatorComponent={this.FlatListItemSeparator}
                        // ListHeaderComponent={this.searchHeader}
                        // onEndReached={() => self.getCoinList()}
                        windowSize={21}
                        initialNumToRender={8}
                        removeClippedSubviews={true}
                        // onEndReachedThreshold={0.5}
                        // onRefresh={this.listRefresh()}
                        renderItem={
                            ({ item, i }) =>


                                <TouchableOpacity key={i} style={marketStyles.renderModalAddCoinTouchableOpacity}
                                    onPress={() => {
                                        self.onSelectCoin(item.token);
                                        self.setState({ check: self.state.exchangeValues.find(f => f.exchange === item.exchange && f.token === item.token) !== undefined })
                                    }}>
                                    <Text key={i} style={marketStyles.renderModalAddCoinTouchableOpacityText}>{self.state.langValue === 'EN' || self.state.langValue === 'English' ?
                                        (item.token).toUpperCase() : (item.token).toUpperCase() + "       " + item.chTokenName}
                                    </Text>
                                </TouchableOpacity>



                        }

                        // refreshControl={

                        //     <RefreshControl
                        //         onRefresh={() => self._onRefresh()}
                        //         refreshing={self.state.refreshing}
                        //         enabled={true}

                        //         progressViewOffset={50}
                        //     />
                        // }
                        keyExtractor={(item, index) => { return index.toString(); }}

                    />

                </View>
            </View>
        )

    };

    // modalDidClose = () => {
    //     this.setState({ successModalOpen: false, failedModalOpen: false });

    // };
    //Custom tab delete

    async tabDelete() {
        let self = this;
        let _tabId = self.state._currentTabId;
        let _tabName = self.state._currentTabName;
        let _url = self.marketAPIBaseUrl + "/tabs/" + _tabId;
        let _authToken = await this.services._retrieveData("userToken");
        self.services.deleteResource(_url, _authToken)
            .then((_response) => {
                // console.log("this.services.deleteResource(_url, _authToken)=>_response: ", _response);
                _response = _response.hasOwnProperty("_response") ? _response._response : _response;

                if (_response.status > 199 && _response.status < 300) {
                    self.setState({ open1: false, isLoading: false, selectedindex: 0, deleted: _tabName, tabRemove: true });
                    self.getMarketTabs();
                }
            });
    }

    //Sending selected exchange
    async sendSelected(exchange) {
        let self = this;
        let _tabId = self.state._currentTabId;
        let _tabName = self.state._currentTabName;

        let _currency = self.state.currency;
        // let _userAttr = await this.services._retrieveData("userAttribute");
        // _userAttr = JSON.parse(_userAttr);
        // if (_userAttr.currency !== undefined && _userAttr.currency) {

        //     _currency = _userAttr.currency;

        // }
        // console.log("userAttr: ", JSON.stringify(_userAttr));

        // console.log("Exchange: ", exchange)


        this.setState({
            addCoinVisible: false,
            addExchangeVisible: false,
            isLoading: false,
            exchangeLoading: true

        });

        let _url = this.marketAPIBaseUrl + "/tabs/" + _tabId + "/coin-prices/" + _currency;
        console.log("URL", _url);

        self.setState({ requesting: true });

        let _authToken = await this.services._retrieveData("userToken");


        if (exchange.length > 0) {
            exchange.map(res => {
                res.chTokenName = res.chTokenName === null ? "" : res.chTokenName;
                res.chExchangeName = res.chExchangeName === null ? "" : res.chExchangeName;

            });
            let _payload = {
                "id": _tabId,
                "name": _tabName,
                "tokens": exchange
            };
            this.services._caller = self;
            this.services.patchData(_url, _authToken, _payload)
                .then((_resp) => {

                    console.log("this.services.patchData(_url, _authToken, _payload)=> _resp: ", _resp);

                    _resp = _resp.hasOwnProperty("_response") ? _resp._response : _resp;
                    if ((_resp.status > 199 && _resp.status < 300) || (_resp.statusCode > 199 && _resp.statusCode < 300)) {
                        //TODO: show appropriate modal
                        if (_resp._response.length < 1) {
                            this.setState({
                                exchangeLoading: false,
                                tokenVisible: false,
                                exchangeValues: [],
                                _currentTokens: []
                            });
                        }
                        else {
                            let _exchangeValues = JSON.parse(_resp._response);
                            let _exchanges = [];
                            let i = 0;
                            _exchangeValues.map(item => {
                                const temp = {
                                    id: i++,
                                    "btcPrice": item.btcPrice,
                                    "chTokenName": item.chTokenName,
                                    "ethPrice": item.ethPrice,
                                    "exchange": item.exchange,
                                    "fullTokenName": item.fullTokenName,
                                    "localPrice": item.localPrice,
                                    "percentage": item.percentage,
                                    "token": item.token,
                                    "usdPrice": item.usdPrice,
                                    "volume": item.volume

                                }
                                _exchanges.push(temp)
                            });
                            this.setState({
                                exchangeValues: _exchanges,
                                tokenVisible: true,
                                exchangeLoading: false
                            });

                        }


                        console.log("exchangeValues: ", exchangeValues);
                    }
                    else {
                        _resp = _resp.hasOwnProperty("_response") ? (_resp._response) : _resp;

                        console.log("this.services.patchData(_url, _authToken, _payload)=> _resp 2: ", _resp);
                        let _errorMsg = (_resp.hasOwnProperty("description") && _resp.description.length > 0)
                            ? _resp.description
                            : handleErrorCode(_resp.code);
                        // TODO: show appropriate modal
                        // alert(_errorMsg);
                        // this.setState({
                        //     userName: _response.name,
                        //     failedModalOpen: true,
                        //     headerFailedMessage: "Failed",
                        //     failedMessage: _errorMsg
                        // });
                    }

                    self.setState({ requesting: false, isLoading: false, });
                })
                .catch((_err) => {
                    //TODO: show appropriate modal
                    // let _errorMsg = (_err.hasOwnProperty("description") && _err.description.length > 0)
                    //     ? _err.description
                    //     : handleErrorCode(_err.code);
                    // //TODO: show appropriate modal
                    // alert(_errorMsg);
                    // self.setState({
                    //     requesting: false,
                    //     failedModalOpen: true,
                    //     failedMessage: _errorMsg,
                    //     headerFailedMessage: "Failed"
                    // });
                });
        }
        else {
            self.setState({
                exchangeLoading: false,
                tokenVisible: false,
                exchangeValues: [],
                _currentTokens: []
            });
            self.showExchange();
        }

    }

    //Updating and Storing tab values
    async tabUpdate(exchange) {
        let self = this;
        let _tabId = self.state._currentTabId;
        let _tabName = self.state._currentTabName;

        console.log("exchange:", exchange);
        let _url = this.marketAPIBaseUrl + "/tabs/" + _tabId;

        console.log("URL", _url);
        let new_tokens = [];

        this.setState({
            addCoinVisible: false,
            addExchangeVisible: false,
            isLoading: false,
            exchangeLoading: false,
        });
        console.log("Tokens:", self.state._currentTokens);
        self.setState({ requesting: true });

        let _authToken = await this.services._retrieveData("userToken");


        exchange.map(res => {
            res.chTokenName = res.chTokenName === null ? "" : res.chTokenName;
            res.chExchangeName = res.chExchangeName === null ? "" : res.chExchangeName;

        });
        let _payload = {
            "id": _tabId,
            "name": _tabName,
            "tokens": exchange
        };
        console.log("Payload: ", _payload);
        this.services.patchData(_url, _authToken, _payload)
            .then((_resp) => {

                console.log("this.services.patchData(_url, _authToken, _payload)=> _resp: ", _resp);

                _resp = _resp.hasOwnProperty("_response") ? _resp._response : _resp;
                if ((_resp.status > 199 && _resp.status < 300) || (_resp.statusCode > 199 && _resp.statusCode < 300)) {

                    let response = JSON.parse(_resp._response);

                    if (response.tokens.length < 1) {
                        console.log("response.tokens.length: ", response.tokens.length)
                        self.getMarketTabs();

                        this.setState({

                            isLoading: false,
                            exchangeLoading: false,
                            _currentTokens: [],
                            tokenVisible: false,
                            exchangeValues: [],

                        });


                        // self.showExchange();
                    }
                    else {
                        this.setState({

                            isLoading: false,
                            exchangeLoading: true,
                            _currentTokens: [],
                            exchangeValues: [],
                            _disabled: false

                        });
                        self.getMarketTabs();
                        self.sendSelected(exchange);

                    }

                    //TODO: show appropriate modal


                }
                else {
                    _resp = _resp.hasOwnProperty("_response") ? (_resp._response) : _resp;

                    console.log("this.services.patchData(_url, _authToken, _payload)=> _resp 3: ", _resp);
                    let _errorMsg = (_resp.hasOwnProperty("description") && _resp.description.length > 0)
                        ? _resp.description
                        : handleErrorCode(_resp.code);
                    //TODO: show appropriate modal
                    //alert(_errorMsg);
                    // this.setState({
                    //     userName: _response.name,
                    //     failedModalOpen: true,
                    //     headerFailedMessage: "Failed",
                    //     failedMessage: _errorMsg
                    // });
                }

                self.setState({ requesting: false, isLoading: false, });
            })
            .catch((_err) => {
                //TODO: show appropriate modalTab
                let _errorMsg = (_err.hasOwnProperty("description") && _err.description.length > 0)
                    ? _err.description
                    : handleErrorCode(_err.code);
                //TODO: show appropriate modal
                // alert(_errorMsg);
                // self.setState({
                //     requesting: false,
                //     failedModalOpen: true,
                //     failedMessage: _errorMsg,
                //     headerFailedMessage: "Failed"
                // });
            });


    }
    // Adding Exchange

    _renderModalAddExchange = () => {
        var self = this;

        var check;

        // self.setState({ isLoading: false })
        return (

            <ScrollView>
                <View style={marketStyles.renderModalAddExchange}>
                    <TouchableOpacity style={marketStyles.renderModalAddExchangeTouchableOpacity1} onPress={() => { self.setState({ addExchangeVisible: false }) }}>
                        <Text style={marketStyles.renderModalAddExchangeTouchableOpacity1Text1}

                        >{I18n.t("Cancel")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={self.state._disabled} style={marketStyles.renderModalAddExchangeTouchableOpacity2} onPress={() => {
                        self.setState({ _disabled: true });
                        // console.log("Value:", value);
                        var s = value.filter(item => item.checked === true)
                            .map(item => item.item);
                        var k = value.filter(item => item.checked === false)
                            .map(item => item.item);
                        console.log("Value:2", k);
                        s.map(item => {
                            self.state._currentTokens.push(item)

                        });
                        if (k.length > 0) {
                            k.map(item1 => {
                                self.state._currentTokens.splice(self.state._currentTokens.findIndex(item => item.exchange === item1.exchange && item.token === item1.token), 1)
                                console.log("Value3:", self.state._currentTokens.findIndex(item => item.exchange === item1.exchange));
                            });
                        }
                        console.log("Value1:", self.state._currentTokens);
                        value = [];
                        self.tabUpdate(self.state._currentTokens);





                        console.log("Checked item", s)
                    }} >
                        <Text style={marketStyles.renderModalAddExchangeTouchableOpacity2Text2}
                        >{I18n.t("Done")}</Text>
                    </TouchableOpacity>
                </View>
                {self.state.exchangeList.map((item, i) =>
                    (<TouchableOpacity disabled={true} key={i} style={marketStyles.renderModalAddExchangeTouchableOpacity3}

                    >
                        <Text key={i} style={marketStyles.renderModalAddExchangeTouchableOpacity3Text3} >
                            {self.state.langValue === 'EN' || self.state.langValue === 'English' ?
                                item.exchange : item.exchange + "       " + item.chExchangeName}
                        </Text>
                        <_CheckBox item={item} i={i} check={self.state.exchangeValues.find(f => f.exchange === item.exchange && f.token === item.token) !== undefined} />
                        {/* checkbox */}
                    </TouchableOpacity>))}
            </ScrollView>
        )
    };



    async onSelectCoin(text) {
        // console.log("onSelectCoin:",text);
        const obj = this;
        let _authToken = await this.services._retrieveData("userToken");
        let _url = this.marketAPIBaseUrl + "/tokens/" + text + "/exchanges";
        console.log("async getChangeList() {=>_url: ", _url);

        obj.setState({ isLoading: true });

        this.services.getResources(_url, _authToken)
            .then(function (_response) {

                _response = _response._response;
                // if (_response.length < 1) {

                //     obj.setState({ isLoading: false })
                // }
                // else {
                _response.map(res => {
                    res.token = text;
                    res.chTokenName = res.chTokenName === null ? "" : res.chTokenName;
                    res.chExchangeName = res.chExchangeName === null ? "" : res.chExchangeName;

                });
                console.log("_respose exchange: ", _response);
                obj.setState({ isLoading: false, exchangeList: _response, addExchangeVisible: true });
                // }

            })
            .catch((_err) => {
                console.log("_err: ", _err);
                obj.setState({ isLoading: false });
            });
    }

    async getCoinList() {
        const obj = this;
        let _authToken = await this.services._retrieveData("userToken");

        let _url = this.marketAPIBaseUrl + "/tokens";
        //  console.log("async getCoinList() {=>_url: ", _url);
        obj.setState({ isLoading: true });
        this.services.getResources(_url, _authToken)
            .then(function (_response) {


                _response = _response._response;

                // console.log("async getCoinList() {=>_respose: ", _response);
                if (_response.length < 1) {
                    _coinList = []
                    obj.setState({ isLoading: false })
                }
                else {
                    _response.map(res => {
                        res.chTokenName = res.chTokenName === null ? "" : res.chTokenName;
                        res.chExchangeName = res.chExchangeName === null ? "" : res.chExchangeName;

                    });
                    _coinList = _response
                    obj.setState({ isLoading: false })

                }

                obj.setState({ addCoinVisible: true });
            })
            .catch((_err) => {
                console.log("_err: ", _err);
                obj.setState({ isLoading: false });
            });

    }


    async getMarketTabs() {
        const self = this;
        let _authToken = await this.services._retrieveData("userToken");
        let _url = this.marketAPIBaseUrl + "/tabs";

        console.log("async getMarketTabs() {=>_url: ", _url);

        self.setState({ isLoading: false, exchangeLoading: false, _authToken: _authToken });
        this.services.getResources(_url, _authToken)
            .then(function (_response) {
                console.log("_respose before: ", _response);

                _response = _response.hasOwnProperty("_response") ? _response._response : _response;
                if (_response.hasOwnProperty("_error")) {
                    self.setState({ tabNames: [], refreshing: false });
                    self.getMarketTabs();
                }
                else {
                    console.log("_response after: ", _response[0].tokens);
                    self.setState({ tabNames: _response, refreshing: false })

                    if (_response.length < 1) {
                        // self.setState({ tabNames: _response })

                        console.log("_respose.length: ", _response.length);
                        self.setState({
                            isLoading: true, addCoinButtonVisible: false, tokenVisible: false, _currentTokens: []
                        });
                    }
                    else if (self.state.selectedindex === 0) {

                        _response[0].tokens.map(res => {
                            res.chTokenName = res.chTokenName === null ? "" : res.chTokenName;
                            res.chExchangeName = res.chExchangeName === null ? "" : res.chExchangeName;

                        });
                        self.setState({
                            isLoading: false, _currentTabId: _response[0].id,
                            _currentTabName: _response[0].name, _currentTokens: _response[0].tokens, addCoinButtonVisible: true
                        })
                        if (_response[0].tokens.length > 0) {
                            self.sendSelected(_response[0].tokens);
                        }
                        else {
                            self.setState({ tokenVisible: false, exchangeValues: [], _currentTokens: [] });
                            self.showExchange();
                        }



                    }
                    else {
                        var i = self.state.selectedindex;
                        console.log("selectedindex: ", i)
                        if (_response[i].tokens.length > 0) {
                            self.setState({
                                isLoading: false,

                                _currentTabId: _response[i].id,
                                _currentTabName: _response[i].name,
                                _currentTokens: _response[i].tokens,
                                addCoinButtonVisible: true

                            });

                            // self.sendSelected(_response[i].tokens);
                        }
                        else {
                            // self.setState({ tokenVisible: false,exchangeValues:[],_currentTokens:[] });
                            self.showExchange();
                        }

                    }
                }
            })
            .catch((_err) => {
                console.log("_err: ", _err);
                self.setState({ isLoading: false });
            });
    }
    /*Tab Selection*/
    FlatListItemSeparator = () => {
        return (
            <View
                style={marketStyles.FlatListItemSeparator}
            />
        );
    }
    listSortAscePrice() {
        var self = this;
        sortingChkPrice = !sortingChkPrice;
        self.setState(
            self.state.exchangeValues.sort((a, b) => (b.usdPrice - a.usdPrice)),

        );


        console.log(" self.state.exchangeValues", self.state.exchangeValues)
    }
    listSortDscePrice() {
        var self = this;
        sortingChkPrice = !sortingChkPrice;
        self.setState(
            self.state.exchangeValues.sort((a, b) => (a.usdPrice - b.usdPrice)),

        );

        console.log(" self.state.exchangeValues1", self.state.exchangeValues)
    }
    listSortAsceVol() {
        var self = this;
        sortingChkVol = !sortingChkVol;
        self.setState(
            self.state.exchangeValues.sort((a, b) => (b.volume - a.volume)),

        );
    }

    listSortDsceVol() {
        var self = this;
        sortingChkVol = !sortingChkVol;
        self.setState(
            self.state.exchangeValues.sort((a, b) => (a.volume - b.volume)),

        );

    }
    listSortAsceToken() {
        var self = this;
        sortingChkToken = !sortingChkToken;
        self.setState(

            self.state.exchangeValues
                .sort(function (a, b) {
                    if (a.token.toLowerCase() < b.token.toLowerCase()) return -1;
                    if (a.token.toLowerCase() > b.token.toLowerCase()) return 1;
                    return 0;
                })

        );
    }
    listSortDsceToken() {
        var self = this;
        sortingChkToken = !sortingChkToken;
        self.setState(

            self.state.exchangeValues
                .sort(function (a, b) {
                    if (a.token.toLowerCase() < b.token.toLowerCase()) return 1;
                    if (a.token.toLowerCase() > b.token.toLowerCase()) return -1;
                    return 0;
                })

        );
    }
    renderHeader = () => {
        var self = this;
        return (

            <View style={marketStyles.renderHeaderMainView}>
                <View style={marketStyles.renderHeaderView1}>
                    <TouchableOpacity onPress={() => {
                        sortingChkToken ? self.listSortAsceToken() : self.listSortDsceToken();
                        self.setState({ sorting: true, sorting1: false, sorting2: false })
                    }}>
                        <Text style={{
                            color: self.state.sorting ? '#6d6d6d' : "#d6d6d6",
                            fontWeight: 'bold', fontSize: 15, textAlign: 'justify'
                        }}>
                            {I18n.t("Coin Name")}
                            {self.state.sorting ? sortingChkToken ? <Icon
                                name='sort-down'
                                size={20}

                            /> : <Icon
                                    name='sort-up'
                                    size={20}

                                /> : " "}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={marketStyles.renderHeaderView2}>
                    <TouchableOpacity hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }} onPress={() => { sortingChkPrice ? self.listSortAscePrice() : self.listSortDscePrice(); self.setState({ sorting: false, sorting1: true, sorting2: false }) }}>
                        <Text style={{
                            color: self.state.sorting1 ? '#6d6d6d' : "#d6d6d6",
                            fontWeight: 'bold', fontSize: 15, textAlign: 'justify'
                        }}>
                            {I18n.t("Price")}
                            {self.state.sorting1 ? sortingChkPrice ? <Icon
                                name='sort-down'
                                size={20}

                            /> : <Icon
                                    name='sort-up'
                                    size={20}

                                /> : ""}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={marketStyles.renderHeaderView3}>
                    <TouchableOpacity onPress={() => {
                        sortingChkVol ? self.listSortAsceVol() : self.listSortDsceVol();
                        self.setState({ sorting: false, sorting1: false, sorting2: true })
                    }}>
                        <Text style={{
                            textAlign: 'center', color: self.state.sorting2 ? '#6d6d6d' : "#d6d6d6",
                            fontWeight: 'bold', fontSize: 15
                        }
                        }>
                            {"%"}{"\n"}
                            {I18n.t("Volume(24h)")}
                            {self.state.sorting2 ? sortingChkVol ? <Icon
                                name='sort-down'
                                size={20}

                            /> : <Icon
                                    name='sort-up'
                                    size={20}

                                /> : ""}
                        </Text>

                    </TouchableOpacity>
                </View>
            </View>);
    };
    _onRefresh() {
        let self = this;
        self.setState({ refreshing: true }, () => {
            //This code will showing the refresh indicator

            self.getMarketTabs();

            //Your code here  
        });


    }
    showExchange() {
        var self = this;
        if (self.state.exchangeLoading) {
            return (
                <View>
                    <ActivityIndicator size='large' />
                </View>
            );
        }

        else if (self.state.tokenVisible) {


            const _greyCurrencyPrint = self.state._greyCurrencyPrint;
            // console.log("exchangeValues: ", _greyCurrencyPrint);

            selectedItem = (item) => {

                return [
                    {
                        component: <View style={{ justifyContent: 'center', flexDirection: 'column', alignSelf: 'center', padding: 10, paddingTop: 25 }}
                        ><Icon
                                name='bell'
                                size={20}
                                color='white'
                                style={{ alignSelf: "center" }}
                            />
                            <Text style={{ color: 'white' }}>{I18n.t("Alert")}</Text>
                        </View>,

                        backgroundColor: '#f08214'
                    },
                    {
                        component: <View style={{ justifyContent: 'center', flexDirection: 'column', alignSelf: 'center', padding: 10, paddingTop: 25 }}
                        >

                            <Icon
                                name='minus-circle'
                                size={20}
                                color='white'
                                style={{ alignSelf: "center" }}

                            />
                            <Text style={{ color: 'white' }}>{I18n.t("Delete")}</Text>

                        </View>,

                        onPress: () => {

                            let updatedTokens = this.state.exchangeValues.filter((currentToken) => item !== currentToken.id);
                            // let tab=self.state.tabNames.splice(self.state.tabNames.IndexOf(self.state._currentTabId),1,[]);


                            // let updatedToken = this.state.exchangeValues[item]
                            let _exchangeValues = [];
                            updatedTokens.map(item => {
                                const temp = {
                                    "token": item.token,
                                    "exchange": item.exchange,
                                    "chTokenName": "",
                                    "chExchangeName": "",
                                }
                                _exchangeValues.push(temp)
                            });

                            console.log("_exchangeValues:", _exchangeValues);
                            console.log("After Filter: ", updatedTokens);

                            if (updatedTokens.length < 1) {

                                this.setState({ _currentTokens: [], exchangeValues: [], tokenVisible: false })
                                this.tabUpdate([]);

                            }
                            else {
                                this.tabUpdate(_exchangeValues);
                            }




                        },

                        backgroundColor: 'red',

                    }
                ]
            }
            return (
                <View style={styles.MainContainer}>
                    <FlatList
                        ref={ref => this.listRef = ref}
                        data={this.state.exchangeValues}
                        //data={this.props.users}
                        //data={this.tabInfo}
                        ItemSeparatorComponent={this.FlatListItemSeparator}
                        ListHeaderComponent={this.renderHeader}

                        // onRefresh={this.listRefresh()}
                        renderItem={
                            ({ item, i }) => {
                                return (

                                    <Swipeout key={i} autoClose={true}

                                        right={selectedItem(item.id)}>

                                        <TouchableHighlight
                                            style={{ backgroundColor: 'white' }}
                                            onPress={() => {
                                                // let _url = this.marketAPIBaseUrl + "/tokens/btc/huobiPro/5m/usd";

                                                let _url = this.marketAPIBaseUrl + "/tokens/" + item.token + "/" + item.exchange + "/5m/" + self.state.currency;


                                                let usdPrice = item[_greyCurrencyPrint];
                                                let localPrice = item.localPrice;
                                                let volume = item.volume;
                                                let percentage = item.percentage;
                                                let token = item.token;
                                                let exchange = item.exchange;
                                                let currency = self.state.currency;
                                                let currencySign = self.state.currencySign;
                                                let greyCurrencySign = self.state._greyCurrencySign;
                                                if ((usdPrice !== null && usdPrice !== 0)
                                                    && (localPrice !== null && localPrice !== 0)
                                                    && (volume !== null && volume !== 0)
                                                    && (percentage !== null && percentage !== 0)
                                                ) {
                                                    self.props.navigation.navigate("MarketGraph", {
                                                        _url: _url, _authToken: this.state._authToken,
                                                        usdPrice: usdPrice,
                                                        localPrice: localPrice,
                                                        volume: volume,
                                                        percentage: percentage,
                                                        token: token,
                                                        exchange: exchange,
                                                        currency: currency,
                                                        currencySign: currencySign,
                                                        greyCurrencySign: greyCurrencySign
                                                    });
                                                }
                                                else {

                                                    self.setState({ openGraphWarningModal: true });

                                                }

                                            }}>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', padding: 10, margin: 5, flex: 1 }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[material.caption]}>{item.fullTokenName ? item.fullTokenName : "-"}</Text>
                                                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 20, }}>{item.token ? item.token.toUpperCase() : "-"}</Text>
                                                    <Text style={[material.caption, { color: '#b8c1c1', }]}>{item.exchange ? item.exchange : "-"}</Text>
                                                </View>

                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 20, textAlign: 'left' }}>{item.localPrice ? this.state.currencySign + " " + item.localPrice.toFixed(2) : "-"}{'\n'}</Text>
                                                    <Text style={{ color: '#b8c1c1', fontWeight: 'bold', fontSize: 17, textAlign: 'left' }}>{item[_greyCurrencyPrint] ? this.state._greyCurrencySign + " " + item[_greyCurrencyPrint] : "-"}</Text>

                                                </View>
                                                <View style={{ flex: 0.7, overflow: 'hidden' }}>
                                                    <Text style={[material.subheading, { textAlign: 'justify', overflow: 'hidden' }, [item.percentage ? item.percentage < 0 ? styles.negative : styles.positive : ""]]}>{item.percentage ? (item.percentage * 100).toFixed(2) + "%" : "-"}</Text>
                                                    <Text style={{ color: 'black', alignSelf: 'center', fontSize: 13, textAlign: 'justify' }}>{item.volume ? item.volume : "-"}</Text>
                                                </View>
                                            </View>

                                        </TouchableHighlight>
                                    </Swipeout>);
                            }}

                        refreshControl={

                            <RefreshControl
                                onRefresh={() => self._onRefresh()}
                                refreshing={self.state.refreshing}
                                enabled={true}

                                progressViewOffset={50}
                            />
                        }
                        keyExtractor={(item, index) => { return index.toString(); }}

                    />
                </View>

            )

        }
        else {

            return (
                self.state.tokenVisible === false && self.state.addCoinButtonVisible && <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{


                        marginVertical: 150,

                    }}>
                        <TouchableOpacity
                            onPress={() => {
                                // self.setState({ isLoading: true, addCoinVisible: true }) 

                                self.setState({ searchTerm: '' });
                                self.getCoinList();
                            }
                            }
                        >
                            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                {I18n.t("Nothing here!")}

                            </Text>
                            <Text fontFamily='sans-serif-condensed' style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
                                {I18n.t("Start adding coins")}

                            </Text>
                            <Text
                                fontFamily='Algerian'
                                style={{
                                    color: '#2F0E5D',
                                    alignSelf: 'center',
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                    borderRadius: 10,
                                    borderColor: '#2F0E5D',
                                    borderWidth: 1,
                                    padding: 10
                                }} >
                                {I18n.t("ADD COIN +")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View >
            )
        }
    }

    onSelectTab(text, name, tokens, i) {
        var self = this;
        tokens.map(res => {
            res.chTokenName = res.chTokenName === null ? "" : res.chTokenName;
            res.chExchangeName = res.chExchangeName === null ? "" : res.chExchangeName;

        });
        self.setState({
            _currentTabName: name, _currentTabId: text,
            selectedindex: i, _currentTokens: tokens
        });
        console.log('Current id', tokens);

        if (tokens.length > 0) {
            self.sendSelected(tokens);
            self.showExchange();
        }
        else {
            self.setState({ tokenVisible: false, exchangeValues: [] });

            self.showExchange();
        }



    }
    handleTabFocus = () => {
        // perform your logic here
        console.log("handleTabFocus = () => {");
    }

    async getLangValue() {
        var self = this;
        let _userAttr = await self.services._retrieveData("userAttribute");
        if (typeof _userAttr !== undefined && _userAttr) {
            // let _payload = {
            //   "handle": _response.handle,
            //   "name": self.state.userName ? self.state.userName : _response.name,
            //   "balance": _response.balance === null ? 0 : _response.balance,
            //   "currency": self.state.defaultCurrency ? self.state.defaultCurrency : _response.currency,
            //   "language": self.state.selectedLanguageCode ? self.state.selectedLanguageCode : _response.language,
            //   "timezone": self.state.defaultTimezone ? self.state.defaultTimezone : _response.timezone,
            //   "minVer": _response.minVer === null ? "0.1" : _response.minVer,
            //   "lastVer": _response.lastVer === null ? "2.1" : _response.lastVer,
            // };

            console.log("userAttribute: ", _userAttr);

            _userAttr = JSON.parse(_userAttr);
            this.setState({
                langValue: _userAttr.language
            });
            self.getCoinList();
            console.log('Some', self.state.langValue);
        }
        else {
            self.setState({ langValue: 'EN' });
            self.getCoinList();
        }

    }


    async _fromLogin() {
        const obj = this;
        const self = this;
        console.log("_fromLogin()=>this.props: ", this.props);

        let response = this.props.navigation.getParam('response');
        let credentials = this.props.navigation.getParam('credentials');

        if (typeof response !== undefined && response) {
            const headers = response.headers;
            const { handle, password } = credentials;

            console.log("async _parseResponse(response, obj) {=>headers: ", headers);

            await this.services._storeData('userToken', headers.token);
            await this.services._storeData('accountId', headers.accountid);

            //record startTime of the active session
            let startTime = await this.services._retrieveData('startTime');

            if (!startTime || startTime.length < 1) {
                let startTime = parseInt(moment().valueOf());
                console.log(startTime);
                var strStartTime = startTime.toString();
                console.log(strStartTime);
                await this.services._storeData('startTime', strStartTime);
            }

            //Start save language here
            let _savedAttr = await this.services._retrieveData("userAttribute");

            let _accountId = headers.accountid;
            let _url = obj.accountAPIBaseUrl + "/" + _accountId;

            let _authToken = headers.token;

            if (typeof _savedAttr !== undefined && _savedAttr) {
                _savedAttr = JSON.parse(_savedAttr);
                console.log("login OK => userAttribute: ", _savedAttr);
                let _payload = {
                    "handle": _savedAttr.handle,
                    "name": _savedAttr.name,
                    "balance": _savedAttr.balance === null ? 0 : _savedAttr.balance,
                    "currency": !_savedAttr.currency ? 'CAD' : _savedAttr.currency,
                    "language": _savedAttr.language === "English" ? "EN" : _savedAttr.language === "Chinese" ? "CH" : _savedAttr.language,
                    "timezone": !_savedAttr.timezone ? 'GMT' : _savedAttr.timezone,
                    "minVer": _savedAttr.minVer === null ? "0.1" : _savedAttr.minVer,
                    "lastVer": _savedAttr.lastVer === null ? "2.1" : _savedAttr.lastVer,
                };

                if (typeof _savedAttr.name === undefined || !_savedAttr.name || _savedAttr.handle !== handle) {
                    this.services.getResources(_url, _authToken)
                        .then((_fromBackend) => {
                            console.log("_fromBackend: ", _fromBackend);

                            if (_savedAttr.handle === handle) {
                                _payload.name = _fromBackend._response.name;
                            }
                            else {
                                console.log("_fromBackend._response: ", _fromBackend._response);
                                _payload = _fromBackend._response
                                Object.keys(_payload).forEach(function (_key, _index) {
                                    if (_payload[_key] === null) {
                                        if (_key === "minVer") {
                                            _payload[_key] = "0.1"
                                        }
                                        else if (_key === "lastVer") {
                                            _payload[_key] = "2.1"
                                        }
                                        else {
                                            _payload[_key] = 0;
                                        }
                                    }
                                });
                            }

                            console.log("if login OK => _payload: ", _payload);

                            this.services.patchData(_url, _authToken, _payload)
                                .then(async function (_resp) {
                                    console.log("if login OK => then => _resp: ", _resp);

                                    await self.services._storeData("userAttribute", JSON.stringify(_payload));

                                    I18n.locale = _payload.language === "English" || _payload.language === "EN" || _payload.language === "en" ? "en" : "chi";
                                    self._componentDidMount();

                                })
                                .catch((_ex) => {
                                    console.log("error on saving user attrubute at Login: ", _ex);
                                    self._componentDidMount();
                                });
                        })
                }
                else {
                    console.log("else login OK => then => _payload before: ", _payload);
                    Object.keys(_payload).forEach(function (_key, _index) {
                        if (_payload[_key] === null) {
                            if (_key === "minVer") {
                                _payload[_key] = "0.1"
                            }
                            else if (_key === "lastVer") {
                                _payload[_key] = "2.1"
                            }
                            else {
                                _payload[_key] = 0;
                            }
                        }
                    });

                    console.log("else login OK => then => _payload after: ", _payload);
                    console.log("else login OK => then => _url: ", _url);

                    this.services.patchData(_url, _authToken, _payload)
                        .then(async function (_resp) {
                            console.log("else login OK => then => _resp: ", _resp);
                            await self.services._storeData("userAttribute", JSON.stringify(_payload));

                            self._componentDidMount();
                        })
                        .catch((_ex) => {
                            console.log("error on saving user attrubute at Login: ", _ex);

                            self._componentDidMount();
                        });
                }
            }
            else {
                self._componentDidMount();
            }
        }
        else {
            self._componentDidMount();
        }
        //End save language here
    }

    async _componentDidMount() {
        // super.componentDidMount();



        this.poll(this);


        //---
        var self = this;
        console.log("tabanmes:", this.refs);
        self.setState({ isLoading: true });

        if (this.marketAPIBaseUrl.length < 1) {
            this.services.getEndPoints(self)
                .then(function () {
                    self.getMarketTabs();
                })

        }
        else {
            this.getMarketTabs();
        }

        let _userAttr = await this.services._retrieveData("userAttribute");

        if (typeof _userAttr !== undefined && _userAttr) {
            _userAttr = JSON.parse(_userAttr);
            this.setState({ langValue: _userAttr.language });

            if (typeof _userAttr.currency !== undefined && _userAttr.currency) {
                // let _payload = {
                //   "handle": _response.handle,
                //   "name": self.state.userName ? self.state.userName : _response.name,
                //   "balance": _response.balance === null ? 0 : _response.balance,
                //   "currency": self.state.defaultCurrency ? self.state.defaultCurrency : _response.currency,
                //   "language": self.state.selectedLanguageCode ? self.state.selectedLanguageCode : _response.language,
                //   "timezone": self.state.defaultTimezone ? self.state.defaultTimezone : _response.timezone,
                //   "minVer": _response.minVer === null ? "0.1" : _response.minVer,
                //   "lastVer": _response.lastVer === null ? "2.1" : _response.lastVer,
                // };

                console.log("userAttribute: ", _userAttr);


                this.setState({
                    currency: _userAttr.currency,

                });
                this.setCurrencySign();
            }
            else {
                this.setState({ currency: 'CAD' });
                this.setCurrencySign();
            }
        }
        else {
            this.setState({ langValue: "EN" });

            this.setState({ currency: 'CAD' });
            this.setCurrencySign();

        }


    }
    componentWillUnmount() {
        this.didMount = false;
        clearInterval(this.intervalId);
    }
    componentDidMount() {
        const self = this;
        this.didMount = true;
        this.ifIsConnected.currentRouteName = "Market";

        const _accountAPIBaseUrl = this.props.navigation.getParam("accountAPIBaseUrl");
        if (typeof _accountAPIBaseUrl !== undefined) {
            this.accountAPIBaseUrl = _accountAPIBaseUrl;
            self._fromLogin(); //To solve issue 45

        }
        else {
            self._componentDidMount();
        }

    }

    greyCurrencyModal() {
        const self = this;
        return (
            <Modal
                offset={0}
                modalDidClose={() => { this.setState({ _greyCurrencyModal: false }) }}
                modalStyle={{
                    borderRadius: 8,
                    margin: 20,
                    padding: 10,
                    backgroundColor: 'white',
                }}
                overlayStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    flex: 1
                }}
                open={this.state._greyCurrencyModal}

                style={{ alignItems: "center", borderColor: '#2F0E5D' }}>
                <View>
                    {
                        greyCurrency.map(
                            (item, i) => {
                                return (<TouchableOpacity
                                    key={i}
                                    style={{
                                        height: 45,
                                        padding: 5,
                                        backgroundColor: 'white',
                                        borderColor: '#2F0E5D',
                                        borderWidth: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 10, marginLeft: 8,
                                        marginRight: 8,
                                        marginTop: 3,
                                    }}
                                    onPress={() => {


                                        self.setGreyCurrencySign(item);

                                    }}
                                >
                                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 14 }}>
                                        {item}

                                    </Text>

                                </TouchableOpacity>
                                );

                            }
                        )
                    }
                </View>
            </Modal>
        );
    }
    _render() {
        const self = this;

        // if (self.state.isLoading) {
        //     return (
        //         <View>
        //             <ActivityIndicator size='small' />
        //             {this.showSnackBar(self, isConnected)}
        //         </View>
        //     );
        // }

        console.log("Market=>_render() {=>this.state.isConnected: ", this.state.isConnected);


        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                // height: '100%'
                //paddingTop: (Platform.OS == 'ios') ? 20 : 0,
            }}>
                {header(this, " ", false)}
                {this.showSnackBar(self, this.state.isConnected)}
                <View style={{
                    backgroundColor: "white",
                    shadowColor: '#c5c1c8',
                    paddingRight: 10,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    borderBottomWidth: Platform.OS === 'ios' ? 0 : 2,
                    // borderBottomWidth: 3,
                    borderColor: "#e8e5e5",
                    height: 60,
                    paddingTop: 6.5,
                }}>

                    <ScrollView horizontal={true}
                        style={{
                            height: 50, paddingLeft: 15, paddingRight: 10,
                            alignContent: 'flex-start', flexDirection: 'row'
                        }}
                        contentContainerStyle={{ paddingRight: 5 }}>
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center', paddingBottom: 6,
                        }}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.TouchableOpacityStyle}
                                onPress={() => { this.setState({ open: true }); }}>
                                <Feather name='plus-circle' size={37} color='#2D0D5F' />
                            </TouchableOpacity>
                        </View>

                        {

                            (!self.state.isLoading && self.state.tabNames !== null)
                                ? self.state.tabNames.map(
                                    (item, i) => {
                                        return (<TouchableOpacity
                                            key={i}
                                            style={i == self.state.selectedindex ? styles.selectedTabStyle : styles.tabStyle}
                                            onLongPress={() => { this.setState({ open1: true, _currentTabId: item.id, _currentTabName: item.name }); }}
                                            onPress={() => self.onSelectTab(item.id, item.name, item.tokens, i)}
                                        >
                                            <Text style={i == self.state.selectedindex ? styles.selectedTextStyle : styles.TextStyle}>{item.name}</Text>
                                        </TouchableOpacity>
                                        );

                                    }
                                )
                                : <ActivityIndicator style={{ height: 200, width: 300 }} />
                        }

                        {/* <ListView
                        style={{padding: 5, height: 50}}
                        horizontal={true}
                        dataSource={this.state.dataSource}
                        renderSeparator={this.ListViewItemSeparator}
                        renderRow={
                            (rowData) =>
                                <Text style={styles.tabStyle} onPress={this.GetListViewItem.bind(this, rowData)}>
                                    {rowData}
                                </Text>
                        }
                    /> */}
                        <View>
                            <Text>{" "}</Text>
                        </View>
                    </ScrollView>

                </View>

                {/* <Text 
                style={{color: '#2F0E5D', alignSelf: 'flex-end', padding:5, margin:5, fontWeight: 'bold'}}
                onPress={()=>{this.addCoin()}}>
                +ADD COIN</Text> */}

                {/*add coin and */}
                {self.state.addCoinButtonVisible && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopColor: '#f1f1f1', margin: 5, padding: 5, paddingTop: 10 }}>

                    <View style={{ flexDirection: 'row', paddingLeft: 10, alignItems: 'flex-start' }}>
                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    // self.setState({ isLoading: true }) 
                                    self.getLangValue()

                                }}
                            >
                                <Feather name='plus' size={24} color='#2F0E5D' />

                            </TouchableOpacity>
                        </View>

                        <View>
                            <TouchableOpacity
                                onPress={() => {
                                    // self.setState({ isLoading: true }) 
                                    self.setState({ searchTerm: "" })
                                    self.getLangValue()


                                }}
                            >
                                <Text
                                    style={{
                                        color: '#2F0E5D',
                                        paddingLeft: 5,
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                    }}
                                >
                                    {I18n.t(" ADD COIN")}
                                </Text>
                            </TouchableOpacity>


                        </View>
                    </View>

                    <View style={{ width: '35%', padding: 5, alignItems: 'flex-end' }}>
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8e8e8',
                            borderRadius: 5,
                        }}>
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 32,
                                }}
                                onPress={() => {
                                    // self.setState({ isLoading: true }) 
                                    self.setState({ _greyCurrencyModal: true })

                                }}
                            >
                                <Text
                                    style={{
                                        color: '#2F0E5D',
                                        alignSelf: 'center',
                                        paddingLeft: 7,
                                        marginLeft: 5,
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: 15
                                    }}
                                >
                                    {self.state._greyCurrency}
                                </Text>
                            </TouchableOpacity>
                            <View>
                                <Icon name="angle-down" style={{ paddingLeft: 3, paddingRight: 9 }} size={24} color='#2F0E5D' />
                            </View>
                        </View>
                    </View>


                </View>
                }
                {/* lodining exchange list */}



                {this.showExchange()}



                {/* Adding coin */}

                {Platform.OS === 'android' ?
                    (<Modal1
                        visible={self.state.addCoinVisible}
                        modalStyle={{ backgroundColor: 'white' }}
                        overlayStyle={{
                            flex: 1, backgroundColor: 'white'
                        }}
                        onRequestClose={() => {
                            self.setState({ addCoinVisible: false, isLoading: false })
                        }}>



                        {header(self, I18n.t("Add coin"), true, "addCoinVisible")}
                        {self._renderModalAddCoin()}

                    </Modal1>) : (<Modal
                        offset={0}
                        modalStyle={{ height: '100%', backgroundColor: 'white' }}
                        overlayStyle={{
                            flex: 1, backgroundColor: 'white'
                        }}
                        open={self.state.addCoinVisible}
                        modalDidClose={() => {
                            self.setState({ addCoinVisible: false, isLoading: false })
                        }}>



                        {header(self, I18n.t("Add coin"), true, "addCoinVisible")}
                        {self._renderModalAddCoin()}

                    </Modal>)}


                {/* Adding Exchange List */}

                <Modal1
                    animationType="slide"
                    transparent={false}
                    style={{ zIndex: 5 }}
                    visible={self.state.addExchangeVisible}
                    onRequestClose={() => {
                        this.setState({ addExchangeVisible: false })
                    }}>

                    <View>

                        {header(self, I18n.t("Add exchanges"), true, "addExchangeVisible")}
                        {self._renderModalAddExchange()}
                    </View>
                </Modal1>

                <Modal
                    offset={this.state.offset}
                    modalDidClose={self.modalDidCloseGraph}
                    modalStyle={{
                        borderRadius: 10,
                        margin: 20,
                        padding: 10,
                        backgroundColor: "white",
                        shadowColor: '#c5c1c8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 25,
                        elevation: 25,
                    }}
                    overlayStyle={{
                        backgroundColor: "white",
                        flex: 1
                    }}
                    open={self.state.openGraphWarningModal}
                    modalDidOpen={this.modalDidOpen}

                >
                    <View style={{ alignItems: "center", borderRadius: 10 }}>
                        <Image
                            source={require('../images/Failed.png')}
                            style={{
                                resizeMode: 'contain',
                                width: 115,
                                height: 115,
                            }}
                        />
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red', margin: 10 }}>{I18n.t("Failed!")}</Text>
                        </View>

                        <View style={{
                            flexDirection: 'column', alignItems: "center",
                            alignItems: "center",
                            margin: 5,
                            padding: 5
                        }}>

                            {/* <Text style={{ fontWeight:'bold',textAlign: 'center', fontSize: 20, color: 'red', marginBottom: 10 }}>{I18n.t('Sorry!')}</Text> */}
                            <Text style={{ textAlign: 'center', fontSize: 16, color: '#8F8F8F', marginBottom: 10 }}>{I18n.t("Not enough data to generate graph")}</Text>

                        </View>
                        <View style={{ alignItems: 'center', }}>
                            <TouchableOpacity
                                onPress={self.modalDidCloseGraph}>
                                <Text style={{
                                    alignSelf: 'center',
                                    fontWeight: 'bold',
                                    color: '#2F0E5D',
                                    height: 40,
                                    width: 90,
                                    fontSize: 14,
                                    paddingBottom: 5,
                                    paddingTop: 10,
                                    paddingLeft: 32,
                                    paddingRight: 10,
                                }}>{I18n.t("OK")}</Text>
                            </TouchableOpacity></View>
                    </View>

                </Modal>
                {this.DuplicateExchangeModal()}
                {this.greyCurrencyModal()}
                <Modal
                    offset={this.state.offset}
                    modalDidClose={this.modalDidClose1}
                    open={this.state.open1}
                    modalStyle={{
                        borderRadius: 20,
                        margin: 20,
                        height: '35%',
                        padding: 10,
                        backgroundColor: "white",
                        shadowColor: '#c5c1c8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 25,
                        elevation: 25,

                    }}
                    modalDidOpen={this.modalDidOpen}
                    overlayStyle={{
                        backgroundColor: "white",
                        flex: 1
                    }}
                >
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center', backgroundColor: 'white', borderRadius: 10
                    }}>

                        <Entypo
                            name='cross'
                            size={35}
                            color='#2F0E5D'
                            onPress={() => { self.setState({ open1: false }) }}
                            style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                        />

                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center', paddingTop: 15, paddingBottom: 20 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this tab?")}</Text>

                        <TouchableOpacity style={{
                            margin: 5, justifyContent: 'center',
                            alignItems: 'center', width: '50%',
                            height: 40, borderRadius: 30, backgroundColor: "#e8e5e5"
                        }} onPress={() => {
                            self.tabDelete();
                        }}>
                            <Text style={{ fontSize: 16, color: '#ff2b2b', fontWeight: 'bold' }}>{I18n.t("Delete tab")}</Text>
                        </TouchableOpacity>

                    </View>

                    {/* <View style={{
                        flexDirection: 'column', alignItems: "center", backgroundColor: 'white',
                      
                    }}>

                        <Text style={{ textAlign: 'center', fontSize: 18, color: 'black', marginBottom: 10 }}>{I18n.t('Do you want to delete this?')}</Text>

                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white' }}>
                        <TouchableOpacity style={{
                            margin: 5, marginLeft: 25, alignSelf: 'flex-start',
                            width: '35%', height: 40, borderRadius: 30,backgroundColor:"#D1D1D1"
                        }} onPress={() => { self.tabDelete() }}>
                            <Text style={{ color: '#2F0E5D', alignSelf: 'center',fontSize:16, fontWeight:'bold', marginTop: 10 }}>{I18n.t('Yes')} </Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            margin: 5, marginRight: 25, alignSelf: 'flex-end',
                            width: '35%', height: 40,borderRadius: 30,backgroundColor:"#D1D1D1"
                        }} onPress={() => { self.setState({ open1: false }) }}>
                            <Text style={{ color: '#2F0E5D', alignSelf: 'center', fontSize:16,fontWeight:'bold', marginTop: 10 }}>{I18n.t('No')}</Text>

                        </TouchableOpacity>
                    </View> */}

                </Modal>
                <Modal
                    offset={this.state.offset}
                    open={this.state.open}
                    modalDidOpen={this.modalDidOpen}
                    modalDidClose={this.modalDidClose}
                    modalStyle={{
                        borderRadius: 20,
                        margin: 20,
                        padding: 10,
                        backgroundColor: "white",
                        shadowColor: '#c5c1c8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 25,
                        elevation: 25,
                    }}
                    overlayStyle={{
                        backgroundColor: "white",
                        flex: 1
                    }}
                >
                    <View style={{ alignItems: "center", backgroundColor: 'white', borderRadius: 10, paddingBottom: 20 }}>
                        <Entypo
                            name='cross'
                            size={35}
                            color='#2F0E5D'
                            onPress={() => { self.setState({ open: false }) }}
                            style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'black', paddingTop: 20, marginBottom: 25 }}>{I18n.t("Create new tab")}</Text>

                        <View style={{ paddingBottom: 24, paddingLeft: 20, paddingRight: 20, padding: 10 }}>

                            <TextInput
                                style={{
                                    fontWeight: 'bold',
                                    height: 45,
                                    //borderColor: "#918b8b",
                                    borderColor: self.state.nameinputfocused ? 'orange' : '#b7b7b7',
                                    backgroundColor: 'white',
                                    width: 270,
                                    borderWidth: 2,
                                    borderRadius: 10,
                                    paddingLeft: 20,
                                    fontSize: 16,
                                }}



                                placeholder={I18n.t("Name")}
                                underlineColorAndroid='transparent'
                                onChangeText={(text) => { self.setState({ _currentTabName: text }) }}
                                onFocus={() => { self.setState({ nameinputfocused: true }) }}
                                onSubmitEditing={() => { self.setState({ nameinputfocused: false }) }}

                            />

                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 5, height: 48, borderRadius: 30, backgroundColor: "#e8e5e5", width: '50%', }}>
                            <TouchableOpacity onPress={() => { self.createTab() }}>
                                <Text style={{ color: "#707070", fontWeight: 'bold', fontSize: 16, paddingBottom: 3 }}>{I18n.t("CREATE")}</Text>
                            </TouchableOpacity>
                            <View style={{ paddingBottom: 2 }}>
                                {this.Check}
                            </View>
                        </View>
                    </View>
                </Modal>
                {/* //Successfullytab created */}
                <Modal
                    offset={this.state.offset}
                    open={this.state.tabSuccess}
                    modalDidOpen={this.modalDidOpen}
                    modalDidClose={this.tabSuccessClose}
                    modalStyle={{
                        borderRadius: 10,
                        margin: 20,
                        padding: 10,
                        backgroundColor: "white",
                        shadowColor: '#c5c1c8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 25,
                        elevation: 25,
                    }}
                    overlayStyle={{
                        backgroundColor: "white",
                        flex: 1
                    }}
                >
                    <View style={{ alignItems: "center", backgroundColor: 'white', borderRadius: 10 }}>
                        <View style={{ alignItems: "center", borderRadius: 10 }}>
                            <Image
                                source={require('../images/Success.png')}
                                style={{
                                    resizeMode: 'contain',
                                    width: 115,
                                    height: 115,
                                }}
                            />
                        </View>
                        <View style={{ alignItems: "center" }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'green', margin: 10 }}>{I18n.t("Success!")}</Text>
                        </View>

                        <Text style={{ fontSize: 16, color: '#8F8F8F', marginBottom: 10, margin: 5, textAlign: 'center' }}>{I18n.t("Successfully ") + self.state._currentTabName + I18n.t(" is created!")}</Text>

                        <TouchableOpacity style={{
                            margin: 5, marginRight: 25, alignSelf: 'center', width: '30%',
                            height: 40, borderRadius: 10
                        }} onPress={() => { self.setState({ tabSuccess: false }) }}>
                            <Text style={{ fontSize: 18, color: '#2F0E5D', alignSelf: 'center', fontWeight: 'bold', marginTop: 10 }}>{I18n.t("OK")}</Text>

                        </TouchableOpacity>
                    </View>
                </Modal>
                {/* Successfully deleting tab */}
                <Modal
                    offset={this.state.offset}
                    open={this.state.tabRemove}
                    modalDidOpen={this.modalDidOpen}
                    modalDidClose={this.tabDeleteClose}
                    modalStyle={{
                        borderRadius: 10,
                        margin: 20,
                        padding: 10,
                        backgroundColor: "white",
                        shadowColor: '#c5c1c8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 25,
                        elevation: 25,
                    }}
                    overlayStyle={{
                        backgroundColor: "white",
                        flex: 1
                    }}

                >
                    <View style={{ alignItems: "center", backgroundColor: 'white', borderRadius: 10 }}>
                        <View style={{ alignItems: "center", borderRadius: 10 }}>
                            <Image
                                source={require('../images/Success.png')}
                                style={{
                                    resizeMode: 'contain',
                                    width: 115,
                                    height: 115,
                                }}
                            />
                            <View style={{ alignItems: "center" }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'green', margin: 10 }}>{I18n.t("Success!")}</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 16, color: '#8F8F8F', marginBottom: 10, margin: 5, textAlign: 'center' }}>{I18n.t("Successfully ") + self.state.deleted + I18n.t(" is deleted!")}</Text>

                        <TouchableOpacity style={{
                            margin: 5, marginRight: 25, alignSelf: 'center', width: '30%',
                            height: 40, borderRadius: 10
                        }} onPress={() => { self.setState({ tabRemove: false }) }}>
                            <Text style={{ fontSize: 18, color: '#2F0E5D', alignSelf: 'center', fontWeight: 'bold', marginTop: 10 }}>{I18n.t("OK")}</Text>

                        </TouchableOpacity>
                    </View>
                </Modal>

                {self.state.successModalOpen ? self.modalForSuccess() : null}
                {self.state.failedModalOpen ? self.modalForFailed() : null}

            </View>

        );
    }

    render() {
        const self = this;
        //   if (self.state.isLoading) {

        //     return (
        //         <View style={{paddingVertical:150}}> 
        //             <ActivityIndicator size='small' />

        //         </View>
        //     );

        // }


        console.log("Market=>render fired!");
        return this.showConnectivityRenderer(self);

    }
}

const stylus = StyleSheet.create({
    MainContainer: {
        flex: 1,
        // backgroundColor: '#eee',
        paddingTop: (Platform.OS == 'ios') ? 20 : 0,
        flexDirection: 'row',
    },

    Animated_View_Style: {
        height: 60,
        backgroundColor: '#FF9800',
        flexDirection: 'row',
        width: 100,
        margin: 5
    },

    View_Inside_Text: {
        color: '#fff',
        fontSize: 24
    },

    TouchableOpacityStyle: {
        width: 60,
        height: 60,
        padding: 10,
    },

    FloatingButtonStyle: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    post: {
        flexDirection: 'row',
    },

    postNumber: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    postContent: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 25,
        paddingRight: 15,
    },

    postBody: {
        marginTop: 10,
        fontSize: 12,
        color: 'lightgray',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabStyle: {
        padding: 10,
        margin: 5,
        backgroundColor: '#e8e8e8',
        height: Platform.OS === 'ios' ? 40 : 37,
        borderRadius: 7,
        borderColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },

    selectedTabStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        margin: 5,
        backgroundColor: '#2F0E5D',
        height: Platform.OS === 'ios' ? 40 : 37,
        // fontFamily: 'helvetica',
        borderRadius: 7,
        // borderColor: '#2F0E5D',
        borderWidth: 1,
        borderColor: 'transparent'

    },
    selectedTextStyle: {
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,

    },
    TextStyle: {
        // backgroundColor: "#d0cdcd",
        fontSize: 15,
        fontWeight: 'bold',
        paddingLeft: 5,
        paddingRight: 5,
        color: '#a7a7a7',
    },
    searchInput: {
        padding: 10,
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 15,
        width: 200
    },
    MainContainer: {

        justifyContent: "space-between",
        flex: 1,
        borderBottomWidth: 0,

        paddingTop: 10,


    },

    FlatListItemStyle: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },

    negative: {
        backgroundColor: '#ff2b2b',
        color: 'white',
        borderRadius: 5,
        textAlign: 'center',


    },
    positive: {
        backgroundColor: '#57b91a',
        color: 'white',
        borderRadius: 5,
        textAlign: 'center',

    }
});