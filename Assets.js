import React, { Component } from 'react';
import { StyleSheet, ListView, View, Text, ActivityIndicator, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Config from './common/Config';
import Modal from "react-native-simple-modal";
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome from "react-native-vector-icons/FontAwesome"
// import {Icon as Icon1} from 'react-native-vector-icons/Feather';
import { header } from './common/helper';
import { TextInput as NativeTextInput } from 'react-native';
import { ListAccordion, TextInput } from 'react-native-paper';
import services from './common/services';
import PortFolioGraph from './Assets_graph_page';
import CollapsibleAsset from './CollapsibleAsset';
import I18n from './i18n';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';

//Test Sync
export default class AssetsScreen extends Config {
    /*Fixed components*/
    // MenuIcon = <Icon name='bars' size={16} color='#737373' />;
    PlusCircleIcon = <Icon name='plus-circle' size={28} color='#2D0D5F' />;
    // DownIconAngle = <Icon name='angle-down' size={24} color='#737373' />;
    // UpIconAngle = <Icon name='angle-up' size={24} color='#737373' />;
    PlusIcon = <Icon name='plus' size={16} color='#2D0D5F' />;
    CameraIcon = <Icon name='camera' size={16} color='#2D0D5F' />;
    // UpIcon = <Icon name='long-arrow-up' size={24} color='white' />;
    DeleteIcon = <Icon name='trash' size={16} color='#2D0D5F' />;
    EditIcon = <Icon name='edit' size={16} color='#2D0D5F' />;
    /*Fixed components*/
    // crossIcon=<Icon name='times' type='regular' size={16} color='orange' />;
    //asset page design review

    constructor(props) {
        super(props);
        this.state = {
            isConnected: true,
            walletList: [],
            catalogList: [],
            walletView: false,
            isCatalogsReady: false,
            showDeleteAssetModal: false,
            showDeleteAssetWarningModal: false,
            currentItem2: null,
            showDeleteWalletWarningModal: false,
            currentWallet: null,
            currentItem: null,
            showEditAssetModal: false,
            showEditAssetNameModal: false,
            selectedAssetIndex: 0,
            assetNameInput: '',
            // deleteWorning:false,
            showDeleteWalletModal: false,
            showEditWalletModal: false,
            showEditWalletNameModal: false,
            selectedWalletIndex: 0,
            walletNameInput: '',
            open: false,
            editinputfocused: false,
            currentCoin: null,
            showDeleteCoinWarningModal: false,

            showCoinEditNameModal: false,
            coinNameInput: '',
            editinputfocused1: false,
            currentCatalog: null,
            graphData: null,
        };
        this.AssetEditButtonClicked = this.AssetEditButtonClicked.bind(this);
        this.didMount = false;
        this.intervalId = -1;

    }
    componentWillUnmount() {
        this.didMount = false;
        clearInterval(this.intervalId);
    }

    componentDidMount() {
        const self = this;
        this.didMount = true;
        this.ifIsConnected.currentRouteName = "Assets";

        self.poll(self);

        console.log("assetAPIBaseUrl: ", self.assetAPIBaseUrl);
        if (self.assetAPIBaseUrl === null || !self.assetAPIBaseUrl || self.assetAPIBaseUrl.length < 1) {
            self.services.getEndPoints(self)
                .then(() => { self.GetCatalogs() })
        }
        else {
            self.GetCatalogs();
        }
    }

    GetCatalogs = async () => {
        this.setState({ isCatalogsReady: false });
        const self = this;
        console.log('****************');
        let _authToken = await self.services._retrieveData("userToken");
        let _url = self.assetAPIBaseUrl + '/catalogs';
        //console.log("Asset url:", _url);
        var temp_walletList = [];
        var temp_catalogList = [];
        self.services.getResources(_url, _authToken)
            .then((_response) => {
                console.log('response after edit:::', _response);
                _response = _response.hasOwnProperty("_response") ? _response._response : _response;
                if (_response.length > 0) {
                    _response.map((item, i) => {
                        if (item.catalogType === 'exchange') {
                            temp_catalogList.push(item);
                        } else {
                            temp_walletList.push(item);
                        }
                    });

                    self.GetReport(_authToken) //Added by riad to refresh the Graph
                        .then((_reportResponse) => {
                            console.log("_reportResponse: ", _reportResponse);

                            if (temp_walletList.length < 1) {
                                self.setState({ graphData: _reportResponse, walletView: false, isCatalogsReady: true, catalogList: temp_catalogList, walletList: [] })
                            }
                            else if (temp_catalogList.length < 1) {
                                self.setState({ graphData: _reportResponse, walletView: true, isCatalogsReady: true, catalogList: [], walletList: temp_walletList });
                            }
                            else {
                                self.setState({ graphData: _reportResponse, walletView: true, isCatalogsReady: true, catalogList: temp_catalogList, walletList: temp_walletList });
                            }
                        });


                }
                else {
                    self.GetReport(_authToken)//Added by riad to refresh the Graph
                        .then((_reportResponse) => {
                            self.setState({ graphData: _reportResponse, isCatalogsReady: true });
                        });

                }
                console.log('****************');
            })
            .catch((_err) => {
                console.log("_err: ", _err);
                self.GetReport(_authToken)//Added by riad to refresh the Graph
                    .then((_reportResponse) => {
                        self.setState({ graphData: _reportResponse, isCatalogsReady: true });
                    });

            });


    }

    refresh() {
        this.GetCatalogs();
    }

    DeleteAssetButtonClicked = (nowItem) => {
        this.setState({ showDeleteAssetWarningModal: true, currentItem: nowItem });
    }
    DeleteAssetWarningModal = () => {
        return (
            <Modal
                open={this.state.showDeleteAssetWarningModal}
                offset={0}
                modalDidClose={() => this.setState({ showDeleteAssetWarningModal: false })}
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
                        onPress={() => { this.setState({ showDeleteAssetWarningModal: false }) }}
                        style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                    />

                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center', paddingTop: 15, paddingBottom: 20 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this?")}</Text>

                    <TouchableOpacity style={{
                        margin: 5, justifyContent: 'center',
                        alignItems: 'center', width: '50%',
                        height: 40, borderRadius: 30, backgroundColor: "#e8e5e5"
                    }} onPress={() => { this.DeleteAsset(this.state.currentItem) }}>
                        <Text style={{ fontSize: 16, color: '#ff2b2b', fontWeight: 'bold' }}>{I18n.t("Delete")}</Text>
                    </TouchableOpacity>

                </View>
                {/* <View style={{ alignItems: "center" }}>

                    <FontAwesome
                        name='times'
                        size={24}
                        color='orange'
                        onPress={() => { this.setState({ showDeleteAssetWarningModal: false }) }}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <Text style={{ textAlign: 'center', alignSelf: 'center', fontSize: 16, color: 'black', marginBottom: 10 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this?")}</Text>

                    <TouchableOpacity style={{
                        margin: 5, marginRight: 25, alignSelf: 'center', width: '35%',
                        height: 38, backgroundColor: '#D1D1D1', borderRadius: 30
                    }} onPress={() => { this.DeleteAsset(this.state.currentItem) }}>
                        <Text style={{ color: 'red', alignSelf: 'center', fontWeight: 'bold', marginTop: 9 }}>{I18n.t("Delete")}</Text>
                    </TouchableOpacity>

                </View> */}
            </Modal>
        );
    }
    DeleteAsset = async (item) => {
        const self = this;
        let _authToken = await self.services._retrieveData("userToken");
        let _url = self.assetAPIBaseUrl + '/catalogs/' + item.id;
        self.services.deleteResource(_url, _authToken)
            .then((_response) => {
                console.log("Delete catalog = async () => {=>_response: ", _response);
                _response = _response.hasOwnProperty("_response") ? _response._response : _response;
                this.setState({ showDeleteAssetWarningModal: false, catalogList: this.state.catalogList.length < 2 ? [] : this.state.catalogList });
                this.GetCatalogs();
            })
            .catch((_err) => {
                console.log("_err: ", _err);
            });
    }

    AssetEditButtonClicked = (item) => {
        var arr = item;
        this.setState({ currentItem: arr });
        this.setState({ showEditAssetNameModal: true, assetNameInput: item.name });
    }
    EditAssetNameModal = () => {
        var self = this
        return (
            <Modal
                open={this.state.showEditAssetNameModal}
                offset={0}
                modalDidClose={() => this.setState({ showEditAssetNameModal: false })}
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


                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center', backgroundColor: 'white', borderRadius: 10
                }}>

                    <Entypo
                        name='cross'
                        size={35}
                        color='#2F0E5D'
                        style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                        onPress={() => { this.setState({ showEditAssetNameModal: false }) }}
                    />
                    <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold', marginBottom: 10 }}>{I18n.t("Edit Name")}</Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 12, paddingLeft: 20, paddingRight: 20, padding: 10 }}>

                        <NativeTextInput
                            style={{
                                fontWeight: 'bold',
                                height: 45,
                                //borderColor: "#918b8b",

                                borderColor: self.state.editinputfocused ? 'orange' : '#b7b7b7',
                                backgroundColor: 'white',
                                width: 270,
                                borderWidth: 2,
                                borderRadius: 10,
                                paddingLeft: 20,
                                fontSize: 16,

                            }}
                            placeholder={I18n.t("Name")}
                            underlineColorAndroid='transparent'
                            value={this.state.assetNameInput}
                            onChangeText={(text) => this.setState({ assetNameInput: text })}
                            onFocus={() => { self.setState({ editinputfocused: true }) }}
                            onSubmitEditing={() => { self.setState({ editinputfocused: false }) }}
                        />

                    </View>
                    {/* <Input
                        placeholder={I18n.t("Name")}
                        underlineColorAndroid='transparent'
                        value={this.state.assetNameInput}
                        onChangeText={(text) => this.setState({ assetNameInput: text })}

                    /> */}

                    <View style={{
                        justifyContent: 'center', alignItems: 'center',
                        margin: 5, height: 40, borderRadius: 30, backgroundColor: "#e8e5e5", width: '35%',
                    }}>
                        <TouchableOpacity style={{
                            margin: 5, justifyContent: 'center',
                            alignItems: 'center', width: '50%',
                            height: 40, borderRadius: 30, backgroundColor: "#e8e5e5"
                        }} onPress={(item) => { this.EditAsset(this.state.currentItem) }}>
                            <Text style={{ paddingRight: 5, fontSize: 16, color: "#707070", fontWeight: 'bold' }}>{I18n.t("OK")}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>
        );
    }
    EditAsset = async (item) => {
        this.setState({ showEditAssetNameModal: false, currentItem: null });
        const self = this;
        let _authToken = await this.services._retrieveData("userToken");
        let _url = self.assetAPIBaseUrl + '/catalogs/' + item.id;

        item.assets.map((asset, i) => {
            Object.keys(asset).map((key, value) => {
                if (key === 'buyTime') { asset[key] += 'Z' }
                else if (asset[key] === null) { asset[key] = 0 }
            });
        });
        let _data = {
            "id": item.id,
            "name": self.state.assetNameInput,
            "address": item.address,
            "coin": item.coin,
            "catalogType": item.catalogType,
            "assets": item.assets
        }
        console.log("Edit asset payload: ", _data);

        console.log("Patch Start: ", parseInt(moment().valueOf()));
        self.services.patchData(_url, _authToken, _data)
            .then(
                (_response) => {

                    console.log("Patch End: ", parseInt(moment().valueOf()));

                    console.log('asset catalog patch response ', _response);
                    _response = _response.hasOwnProperty("_response") ? _response._response : _response;

                    if (_response.hasOwnProperty("error")) {
                        const _error = JSON.parse(_response.error);
                        if (_error.hasOwnProperty("code")) {
                            alert(handleErrorCode(_error.code));
                        }
                        else if (_error.hasOwnProperty("message")) {
                            alert(_error.message);
                        }
                        else {
                            alert("Unknown error occured!");
                        }
                    }
                    else {
                        this.setState({ isCatalogsReady: false });
                        this.refresh();
                    }
                }
            )
            .catch((_err) => {
                console.log("_err: ", _err);

            });
    }

    AssetTool = (i, item) => {
        return (
            <View style={assetsStyle.AssetToolView1}>
                <View style={assetsStyle.AssetToolView2}>
                    {this.AddButton(i, item)}
                    {this.ImportButton(i, item)}
                </View>
                <TouchableOpacity
                    onPress={() => alert('not yet implemented')}
                ><Text style={{ paddingTop: 20 }}>Delete</Text></TouchableOpacity>
                <TouchableOpacity
                    onPress={() => alert('not yet implemented')}
                ><Text>Edit</Text></TouchableOpacity>
            </View>
        );
    }
    AddButton = (i, item) => {
        return (
            <TouchableOpacity
                style={assetsStyle.AddButton}
                onPress={() => { this.AddButtonClicked(item) }}
            >
                {this.PlusIcon}
                <Text style={{ color: '#2D0D5F' }}>{I18n.t("Add")}</Text>
            </TouchableOpacity>
        );
    }
    AddButtonClicked = (item) => {
        this.setState({ currentCatalog: item });

        if (item !== null) {
            this.props.navigation.navigate('AddNewAsset',
                {
                    // currentCatalog: item, //Added to fix collapsible
                    onGoBack: () => this.refresh(),
                    portfolio: I18n.t('Add Coin to ') + '"' + item.name + '"' + I18n.t(' portfolio'),
                    catalogId: item.id,
                    catalogName: item.name,
                    address: item.address,
                    catalogType: item.catalogType,
                    coin: item.coin,
                    token: '',
                    tokenId: '',
                }
            )
        }
    }
    ImportButton = (i) => {
        return (
            <TouchableOpacity style={assetsStyle.ImportButton}
                onPress={() => { this.ImportAssets() }}
            >
                {this.CameraIcon}
                <Text style={{ color: '#2D0D5F' }} > {I18n.t("Import")}</Text>
            </TouchableOpacity>
        );
    }
    ImportAssets = () => {
        alert('Import existing assets');
    }

    DeleteWalletButtonClicked = (item) => {
        this.setState({ showDeleteWalletWarningModal: true, currentWallet: item });
    }
    DeleteWalletWarningModal = () => {
        return (
            <Modal
                open={this.state.showDeleteWalletWarningModal}
                offset={0}
                modalDidClose={() => this.setState({ showDeleteWalletWarningModal: false })}
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
                        onPress={() => { this.setState({ showDeleteWalletWarningModal: false }) }}

                        style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                    />

                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center', paddingTop: 15, paddingBottom: 20 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this?")}</Text>

                    <TouchableOpacity style={{
                        margin: 5, justifyContent: 'center',
                        alignItems: 'center', width: '50%',
                        height: 40, borderRadius: 30, backgroundColor: "#e8e5e5"
                    }} onPress={() => { this.DeleteWallet(this.state.currentWallet) }}>
                        <Text style={{ fontSize: 16, color: '#ff2b2b', fontWeight: 'bold' }}>{I18n.t("Delete")}</Text>
                    </TouchableOpacity>

                </View>

                {/* <View style={{ alignItems: "center" }}>

                    <FontAwesome
                        name='times'
                        size={24}
                        color='orange'
                        Type='Light'
                        onPress={() => { this.setState({ showDeleteWalletWarningModal: false }) }}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <Text style={{ textAlign: 'center', alignSelf: 'center', fontSize: 16, color: 'black', marginBottom: 10 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this?")}</Text>

                    <TouchableOpacity style={{
                        margin: 5, marginRight: 25, alignSelf: 'center', width: '35%',
                        height: 38, backgroundColor: '#D1D1D1', borderRadius: 30
                    }} onPress={() => { this.DeleteWallet(this.state.currentWallet) }}>
                        <Text style={{ color: 'red', alignSelf: 'center', fontWeight: 'bold', marginTop: 9 }}>{I18n.t("Delete")}</Text>
                    </TouchableOpacity>

                </View> */}
            </Modal>
        );

    }
    DeleteWallet = async (item) => {
        const self = this;
        let _authToken = await self.services._retrieveData("userToken");
        let _url = self.assetAPIBaseUrl + '/catalogs/' + item.id;
        console.log('deleting: ', _url);
        self.services.deleteResource(_url, _authToken)
            .then((_response) => {
                _response = _response.hasOwnProperty("_response") ? _response._response : _response;

                this.setState({ showDeleteWalletWarningModal: false, walletView: false, walletList: this.state.walletList.length < 2 ? [] : this.state.walletList });
                this.GetCatalogs();
            })
            .catch((_err) => {
                console.log("_err: ", _err);
            });
    }

    EditWalletModal = () => {
        return (
            <Modal
                open={this.state.showEditWalletModal}
                offset={0}
                modalDidClose={() => this.setState({ showEditWalletModal: false })}
                style={styles.pickerStyle}
            >
                <ScrollView style={styles.countryCodeChildView}>
                    {
                        this.state.walletList.map(
                            (item, i) => {
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={{
                                            padding: 5,
                                            borderColor: 'transparent',
                                            borderWidth: 7,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            shadowColor: '#c5c1c8',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.8,
                                            shadowRadius: 25,
                                            elevation: 25,
                                            borderRadius: 2, marginLeft: 5,
                                            marginRight: 5,
                                            marginTop: 10,
                                        }}
                                        onPress={() => this.setState({
                                            showEditWalletModal: false,
                                            showEditWalletNameModal: true,
                                            selectedWalletIndex: i,
                                            walletNameInput: item.name
                                        })
                                        }
                                    >
                                        <Text style={{ fontSize: 14 }}>{item.name}</Text>
                                    </TouchableOpacity>
                                );
                            }
                        )
                    }
                </ScrollView>
            </Modal>
        );
    }
    WalletEditButtonClicked = (item) => {
        var arr = item;
        this.setState({ currentWallet: arr });
        this.setState({ showEditWalletNameModal: true, walletNameInput: item.name });
    }
    EditWalletNameModal = () => {
        var self = this
        return (
            <Modal
                open={this.state.showEditWalletNameModal}
                offset={0}
                modalDidClose={() => this.setState({ showEditWalletNameModal: false })}
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
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center', backgroundColor: 'white', borderRadius: 10
                }}>

                    <Entypo
                        name='cross'
                        size={35}
                        color='#2F0E5D'
                        style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                        onPress={() => { this.setState({ showEditWalletNameModal: false }) }}
                    />
                    <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold', marginBottom: 10 }}>{I18n.t("Edit Name")}</Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 12, paddingLeft: 20, paddingRight: 20, padding: 10 }}>

                        <NativeTextInput
                            style={{
                                fontWeight: 'bold',
                                height: 45,
                                //borderColor: "#918b8b",

                                borderColor: self.state.editinputfocused1 ? 'orange' : '#b7b7b7',
                                backgroundColor: 'white',
                                width: 270,
                                borderWidth: 2,
                                borderRadius: 10,
                                paddingLeft: 20,
                                fontSize: 16,

                            }}
                            placeholder={I18n.t("Name")}
                            underlineColorAndroid='transparent'
                            value={this.state.walletNameInput}
                            onChangeText={(text) => this.setState({ walletNameInput: text })}
                            onFocus={() => { self.setState({ editinputfocused1: true }) }}
                            onBlur={() => { self.setState({ editinputfocused1: false }) }}
                        />

                    </View>
                    {/* <Input
                        placeholder={I18n.t("Name")}
                        underlineColorAndroid='transparent'
                        value={this.state.assetNameInput}
                        onChangeText={(text) => this.setState({ assetNameInput: text })}

                    /> */}

                    <View style={{
                        justifyContent: 'center', alignItems: 'center',
                        margin: 5, height: 40, borderRadius: 30, backgroundColor: "#e8e5e5", width: '35%',
                    }}>
                        <TouchableOpacity style={{
                            margin: 5, justifyContent: 'center',
                            alignItems: 'center', width: '50%',
                            height: 40, borderRadius: 30, backgroundColor: "#e8e5e5"
                        }} onPress={(item) => { this.EditWallet() }}>
                            <Text style={{ paddingRight: 5, fontSize: 16, color: "#707070", fontWeight: 'bold' }}>{I18n.t("OK")}</Text>
                        </TouchableOpacity>
                    </View>

                </View>


                {/* <View style={{ alignItems: "center", backgroundColor: 'white', borderRadius: 10 }}>
                    <Icon
                        name='x'
                        size={24}
                        color='#F08214'
                        onPress={() => { this.setState({ showEditWalletNameModal: false }) }}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <Text style={{ fontSize: 20, color: '#2F0E5D', marginBottom: 10 }}>{I18n.t("Edit name")}</Text>
                    <Input
                        placeholder={I18n.t("Name")}
                        underlineColorAndroid='transparent'
                        value={this.state.walletNameInput}
                        onChangeText={(text) => this.setState({ walletNameInput: text })}

                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white' }}>
                    <TouchableOpacity style={{
                        margin: 5, marginLeft: 25, alignSelf: 'flex-start',
                        width: '40%', height: 40, borderWidth: 1, borderRadius: 10
                    }} onPress={(item) => { this.EditWallet() }}>
                        <Text style={{ color: '#2F0E5D', alignSelf: 'center', fontWeight: 'bold', marginTop: 10 }}>{I18n.t('OK')} </Text>

                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        margin: 5, marginRight: 25, alignSelf: 'flex-end',
                        width: '40%', height: 40, borderWidth: 1, borderRadius: 10
                    }} onPress={() => this.setState({ showEditWalletNameModal: false })}>
                        <Text style={{ color: '#2F0E5D', alignSelf: 'center', fontWeight: 'bold', marginTop: 10 }}>{I18n.t('Cancel')}</Text>

                    </TouchableOpacity>
                </View> */}
            </Modal>
        );
    }
    EditWallet = async () => {
        this.setState({ showEditWalletNameModal: false });
        const self = this;
        let _authToken = await this.services._retrieveData("userToken");
        let item = self.state.walletList[self.state.selectedWalletIndex];
        let _url = self.assetAPIBaseUrl + '/catalogs/' + item.id;

        item.assets.map((asset, i) => {
            Object.keys(asset).map((key, value) => {
                if (key === 'buyTime') { asset[key] += 'Z' }
                else if (asset[key] === null) { asset[key] = 0 }
            });
        });
        let _data = {
            "id": item.id,
            "name": self.state.walletNameInput,
            "address": item.address,
            "coin": item.coin,
            "catalogType": item.catalogType,
            "assets": item.assets
        }
        console.log('Edit wallet url:: ', _url);
        console.log('Edit wallet data:: ', _data);
        self.services.patchData(_url, _authToken, _data)
            .then(
                (_response) => {
                    console.log('asset catalog patch response ', _response);
                    _response = _response.hasOwnProperty("_response") ? _response._response : _response;

                    if (_response.hasOwnProperty("error")) {
                        const _error = JSON.parse(_response.error);
                        if (_error.hasOwnProperty("code")) {
                            alert(handleErrorCode(_error.code));
                        }
                        else if (_error.hasOwnProperty("message")) {
                            alert(_error.message);
                        }
                        else {
                            alert("Unknown error occured!");
                        }
                    }
                    else {
                        this.refresh();
                    }
                }
            )
            .catch((_err) => {
                console.log("_err: ", _err);

            });
    }
    WalletTool = (i, item) => {
        return (
            <View style={assetsStyle.AssetToolView1}>
                <View style={assetsStyle.AssetToolView2}>
                    {this.WalletToolAddButton(i, item)}
                    {this.WalletToolImportButton(i, item)}
                </View>
                <TouchableOpacity
                    onPress={() => alert('not yet implemented')}
                ><Text style={{ color: '#2D0D5F' }}>{I18n.t("Delete")}</Text></TouchableOpacity>
                <TouchableOpacity
                    onPress={() => alert('not yet implemented')}
                ><Text>{I18n.t("Edit")}</Text></TouchableOpacity>
            </View>
        );
    }
    WalletToolAddButton = (i, item) => {
        return (
            <TouchableOpacity
                style={assetsStyle.AddButton}
                onPress={() => { this.WalletChilddAddButtonClicked(i, item) }}
            >
                {this.PlusIcon}
                <Text style={{ color: '#2D0D5F' }}> {I18n.t("Add")}</Text>
            </TouchableOpacity>
        );
    }
    WalletChilddAddButtonClicked = (i, item) => {
        this.setState({ selectedAssetIndex: i, currentCatalog: item });
        this.props.navigation.navigate('AddNewAsset',
            {
                // currentCatalog: item,
                onGoBack: () => this.refresh(),
                portfolio: I18n.t('Add Coin to ') + '"' + item.name + '"' + I18n.t(' portfolio'),
                catalogId: item.id,
                catalogName: item.name,
                address: item.address,
                catalogType: item.catalogType,
                token: '',
                tokenId: '',
            }
        )
    }
    WalletToolImportButton = (i) => {
        return (
            <TouchableOpacity style={assetsStyle.ImportButton}
                onPress={() => { this.WalletChildImportAssets() }}
            >
                {this.CameraIcon}
                <Text style={{ color: '#2D0D5F' }}> {I18n.t("Import")}</Text>
            </TouchableOpacity>
        );
    }
    WalletChildImportAssets = () => {
        alert('Import existing assets');
    }

    GenericHeader() {
        return (
            <View style={assetsStyle.GenericHeaderMainView}>
                <View style={assetsStyle.GenericHeaderView}><Text style={assetsStyle.GenericHeaderText}>{I18n.t("Token")}</Text></View>
                <View style={assetsStyle.GenericHeaderView}><Text style={assetsStyle.GenericHeaderText}>{I18n.t("Amount")}</Text></View>
                <View style={assetsStyle.GenericHeaderView}><Text style={assetsStyle.GenericHeaderText}>{I18n.t("Buy Price")}</Text></View>
                <View style={assetsStyle.GenericHeaderView}><Text style={assetsStyle.GenericHeaderText}>{I18n.t("Current Price")}</Text></View>
                <View style={assetsStyle.GenericHeaderView}><Text style={assetsStyle.GenericHeaderText}>{I18n.t("Earnings")}</Text></View>
                <View style={assetsStyle.GenericHeaderView}><Text style={assetsStyle.GenericHeaderText}>{I18n.t("% of return")}</Text></View>
            </View>
        );
    }
    GenericRow(j, assetarr) {
        x = j % 2;
        if (x == 0) { bkcolor = 'grey'; } else { bkcolor = 'white'; }
        return (
            <View style={{
                flex: 1, alignSelf: 'stretch',
                flexDirection: 'row', backgroundColor: bkcolor
            }}>
                <View style={assetsStyle.GenericHeaderView}>
                    <Text style={assetsStyle.GenericHeaderTextView}>{assetarr.token}</Text></View>
                <View style={assetsStyle.GenericHeaderView}>
                    <Text style={assetsStyle.GenericHeaderTextView}>{assetarr.buyAmount}</Text></View>
                <View style={assetsStyle.GenericHeaderView}>
                    <Text style={assetsStyle.GenericHeaderTextView}>{assetarr.buyPrice > 0 ? assetarr.buyPrice : assetarr.buyValue}</Text></View>
                <View style={assetsStyle.GenericHeaderView}>
                    <Text style={assetsStyle.GenericHeaderTextView}>{assetarr.changedValue}</Text></View>
                <View style={assetsStyle.GenericHeaderView}>
                    <Text style={assetsStyle.GenericHeaderTextView}>{assetarr.changedValue}</Text></View>
                <View style={assetsStyle.GenericHeaderView}>
                    <Text style={assetsStyle.GenericHeaderTextView}>{assetarr.changedPercentage}</Text></View>
            </View>
        );
    }

    CoinDeleteButtonClicked = (item, currentCatalog) => {
        console.log("CoinDeleteButtonClicked = (item, currentCatalog) => {=> currentCatalog: ", currentCatalog);

        console.log('coin delete button clicked!');
        var arr = item;
        this.setState({ showDeleteCoinWarningModal: true, currentCoin: arr, currentCatalog: currentCatalog });
    }
    DeleteCoinWarningModal = () => {
        return (
            <Modal
                open={this.state.showDeleteCoinWarningModal}
                offset={0}
                modalDidClose={() => this.setState({ showDeleteCoinWarningModal: false })}
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
                        onPress={() => { this.setState({ showDeleteCoinWarningModal: false }) }}
                        style={{ alignSelf: 'flex-end', paddingRight: 10, paddingTop: 10 }}
                    />

                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center', paddingTop: 15, paddingBottom: 20 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this?")}</Text>

                    <TouchableOpacity style={{
                        margin: 5, justifyContent: 'center',
                        alignItems: 'center', width: '50%',
                        height: 40, borderRadius: 30, backgroundColor: "#e8e5e5"
                    }} onPress={() => { this.DeleteCoin(this.state.currentCoin) }}>
                        <Text style={{ fontSize: 16, color: '#ff2b2b', fontWeight: 'bold' }}>{I18n.t("Delete")}</Text>
                    </TouchableOpacity>

                </View>
                {/* <View style={{ alignItems: "center" }}>

                    <FontAwesome
                        name='times'
                        size={24}
                        color='orange'
                        Type='Light'
                        onPress={() => { this.setState({ showDeleteCoinWarningModal: false }) }}
                        style={{ alignSelf: 'flex-end' }}
                    />
                    <Text style={{ textAlign: 'center', alignSelf: 'center', fontSize: 16, color: 'black', marginBottom: 10 }}>{I18n.t("Are you sure you want to")}{'\n'}{I18n.t("delete this?")}</Text>

                    <TouchableOpacity style={{
                        margin: 5, marginRight: 25, alignSelf: 'center', width: '35%',
                        height: 38, backgroundColor: '#D1D1D1', borderRadius: 30
                    }} onPress={() => { this.DeleteCoin(this.state.currentCoin) }}>
                        <Text style={{ color: 'red', alignSelf: 'center', fontWeight: 'bold', marginTop: 9 }}>{I18n.t("Delete")}</Text>
                    </TouchableOpacity>

                </View> */}
            </Modal>
        );
    }
    DeleteCoin = async (item) => {
        this.setState({ showDeleteCoinWarningModal: false });
        const self = this;
        let _authToken = await self.services._retrieveData("userToken");
        let _url = self.assetAPIBaseUrl + '/assets/' + item.id;
        console.log('deleting: ', _url);
        self.services.deleteResource(_url, _authToken)
            .then((_response) => {
                _response = _response.hasOwnProperty("_response") ? _response._response : _response;
                this.GetCatalogs();
            })
            .catch((_err) => {
                console.log("_err: ", _err);
            });
    }
    //Sync
    CoinEditButtonClicked = (item, catalog) => {
        var arr = item;
        console.log("Editing coin from swipeout", item);
        this.props.navigation.navigate('AddNewAsset',
            {
                onGoBack: () => this.refresh(),
                portfolio: I18n.t('Editing Coin ') + item.token,
                catalogId: item.assetCatalogId,
                catalogName: catalog.name,
                address: catalog.address,
                catalogType: catalog.catalogType,
                token: item.token,
                tokenId: item.id,
                asset: item,
                catalog: catalog
            }
        )
        //this.setState({ currentCoin: arr });
        //this.setState({ showCoinEditNameModal: true, coinNameInput: item.name });
    }

    editAssetFunctionClicked = (assetItem) => {
        this.setState({ catalog: this.props.catalog });
        console.log("editAssetFunction=(assetItem)=>{=>this.state.catalog: ", this.state.catalog);
        this.props.navigation.navigate('AddNewAsset',
            {
                onGoBack: () => this.refresh(),
                portfolio: I18n.t('Edit Asset') + ' "' + assetItem.name + '"' + I18n.t('of') + '"' + this.state.catalog.name + '"',
                catalogId: this.state.catalog.id,
                catalogName: '',
                address: '',
                catalogType: 'exchange',
                catalog: this.state.catalog,
                mode: "edit",
                assetItem: assetItem,
            },
        )
    }

    CoinEditNameModal = () => {
        return (
            <Modal
                open={this.state.showCoinEditNameModal}
                offset={0}
                modalDidClose={() => this.setState({ showCoinEditNameModal: false })}
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
                overlayStyle={{
                    backgroundColor: "white",
                    flex: 1
                }}
            >
                <TextInput
                    style={{ width: 100, }}
                    value={this.state.coinNameInput}
                    onChangeText={(text) => this.setState({ coinNameInput: text })}
                />
                <TouchableOpacity
                    style={{
                        padding: 5,
                        borderColor: 'transparent',
                        borderWidth: 7,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        shadowColor: '#c5c1c8',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 25,
                        elevation: 2.5,
                        borderRadius: 2, marginLeft: 5,
                        marginRight: 5,
                        marginTop: 10,
                    }}
                    onPress={(item) => { this.EditCoin(this.state.currentCoin) }}
                >
                    <Text style={{ fontSize: 14 }}>{I18n.t("Ok")}</Text>
                </TouchableOpacity>
            </Modal>
        );
    }
    EditCoin = async (item) => {
        this.setState({ showCoinEditNameModal: false, currentCoin: null });
        const self = this;
        let _authToken = await this.services._retrieveData("userToken");
        let _url = self.assetAPIBaseUrl + '/assets/' + item.id;


        Object.keys(item).map(function (key) {
            if (key === 'buyTime') { item[key] += 'Z' }
            else if (item[key] == null) { item[key] = 0 }
        });
        let x = Number.parseFloat(this.state.coinNameInput);
        let _data = {
            "id": item.id,
            "assetCatalogId": item.assetCatalogId,
            "token": item.token,
            "buyAmount": x,
            "buyPrice": item.buyPrice,
            "buyValue": item.buyValue,
            "buyUnit": item.buyUnit,
            "buyTime": item.buyTime,
            "comment": item.comment,
            "totalValue": x,
            "changedValue": item.changedValue,
            "changedPercentage": item.changedPercentage,
            "usdTotalValue": item.usdTotalValue,
            "btcTotalValue": item.btcTotalValue
        };
        console.log("Edit coin payload: ", _data);

        self.services.patchData(_url, _authToken, _data)
            .then(
                (_response) => {
                    console.log('asset catalog patch response ', _response);
                    _response = _response.hasOwnProperty("_response") ? _response._response : _response;

                    if (_response.hasOwnProperty("error")) {
                        const _error = JSON.parse(_response.error);
                        if (_error.hasOwnProperty("code")) {
                            alert(handleErrorCode(_error.code));
                        }
                        else if (_error.hasOwnProperty("message")) {
                            alert(_error.message);
                        }
                        else {
                            alert("Unknown error occured!");
                        }
                    }
                    else {
                        this.refresh();
                    }
                }
            )
            .catch((_err) => {
                console.log("_err: ", _err);

            });
    }
    walletAddView() {
        if (this.state.walletView) {
            return (<View style={assetsStyle.MainView}>
                <View><Text style={{ fontWeight: 'bold', fontSize: 15, color: 'gray' }}>{I18n.t("Wallets")}</Text></View>

                <View style={assetsStyle.ChildView}>
                    <View style={{ paddingTop: 3 }}>{this.PlusIcon}</View>

                    <View>
                        <TouchableOpacity style={assetsStyle.TextView1}
                            onPress={() => this.props.navigation.navigate('AddNewAsset',
                                {

                                    onGoBack: () => this.refresh(),
                                    portfolio: I18n.t('Add new wallet'),
                                    catalogId: '',
                                    catalogName: '',
                                    address: '',
                                    catalogType: 'wallet',
                                    token: '',
                                    tokenId: '',
                                },
                            )}
                        >

                            <Text style={assetsStyle.TextView2}>{I18n.t("Add")}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: 3, paddingLeft: 10 }}>{this.CameraIcon}</View>
                    <View>
                        <TouchableOpacity style={assetsStyle.TextView3}>

                            <Text style={assetsStyle.TextView4}>{I18n.t("Import")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>);
        }
    }

    GetReport = (_authToken) => {
        return new Promise((resolve) => {
            const self = this;

            let _url = self.assetAPIBaseUrl + '/report';

            this.services.getResources(_url, _authToken)
                .then((_response) => {
                    _response = _response.hasOwnProperty("_response") ? _response._response : _response;

                    console.log("GetReport = () => {=>_response: ", _response);
                    resolve(_response);
                })
                .catch((_err) => {
                    console.log("_err: ", _err);
                    resolve(_response);
                });
        });
    }
    _render() {
        const self = this;
        return (
            <View style={{ backgroundColor: 'white', height: '100%' }}>
                {header(this, "", false)}
                {this.showSnackBar(self, this.state.isConnected)}

                <ScrollView style={assetsStyle.ScrollView}>
                    {(self.state.isCatalogsReady && self.state.graphData.dailyReports !== null
                        && self.state.graphData.dailyReports.length > 0) &&
                        < PortFolioGraph graphData={self.state.graphData} isReportReady={false} />
                    }
                    <TouchableOpacity style={{ flexDirection: 'row', padding: 10, margin: 5 }}
                        onPress={() => this.props.navigation.navigate('AddNewAsset',
                            {
                                onGoBack: () => this.refresh(),
                                portfolio: I18n.t('Add new asset'),
                                catalogId: '',
                                catalogName: '',
                                address: '',
                                catalogType: 'exchange',
                                token: '',
                                tokenId: '',
                            },
                        )}
                    >
                        {this.PlusCircleIcon}
                        <Text style={assetsStyle.AddNewAssetText}> {I18n.t("Add new assets")}</Text>
                    </TouchableOpacity>
                    <View>
                        {
                            this.state.isCatalogsReady ?
                                this.state.catalogList.map((item, i) => {
                                    return (
                                        <View key={i}>
                                            <CollapsibleAsset
                                                currentCatalog={this.state.currentCatalog}
                                                catalog={item}
                                                assetEditFunction={this.AssetEditButtonClicked}
                                                assetDeleteFunction={this.DeleteAssetButtonClicked}
                                                AddButtonClicked={this.AddButtonClicked}
                                                deleteCoinFunction={this.CoinDeleteButtonClicked}
                                                editCoinFunction={this.CoinEditButtonClicked}
                                            />
                                        </View>
                                    )
                                }) : <ActivityIndicator style={{ height: 200, width: 300 }} />
                        }
                    </View>


                    {this.walletAddView()}
                    <View>
                        {
                            this.state.isCatalogsReady ?
                                this.state.walletList.map((item, i) => {
                                    return (
                                        <View key={i}>
                                            <CollapsibleAsset
                                                currentCatalog={this.state.currentCatalog}
                                                catalog={item}
                                                assetEditFunction={this.WalletEditButtonClicked}
                                                assetDeleteFunction={this.DeleteWalletButtonClicked}
                                                AddButtonClicked={this.AddButtonClicked}
                                                deleteCoinFunction={this.CoinDeleteButtonClicked}
                                                editCoinFunction={this.CoinEditButtonClicked}
                                            />
                                        </View>
                                    )
                                }) :
                                //<ActivityIndicator style={{ height: 200, width: 300 }} />
                                null
                        }
                    </View>

                    <View style={assetsStyle.walletListView} />
                </ScrollView>
                {this.DeleteAssetWarningModal()}
                {this.EditAssetNameModal()}

                {this.DeleteWalletWarningModal()}
                {this.EditWalletModal()}
                {this.EditWalletNameModal()}

                {this.DeleteCoinWarningModal()}
                {this.CoinEditNameModal()}
            </View>
        );
    }
    render() {
        const self = this;
        return this.showConnectivityRenderer(self);
    }
}

const styles = StyleSheet.create({
    pickerStyle: { borderRadius: 10 },
    inputOpacityParent: {
        flexDirection: 'row',
        margin: 5,
        borderRadius: 10,
        backgroundColor: 'white',
        borderColor: '#F08214',
        borderWidth: 1.9,
    },
    TextInputStyle: { flex: 1, padding: 10, fontSize: 16.3 },
    numberInputStyle: { padding: 10, fontSize: 12, width: 200 },
    numberInputOpacityParent: {
        paddingLeft: 45,
        flexDirection: 'row',
        margin: 5,
        borderRadius: 10,
        backgroundColor: 'white',
        borderColor: '#F08214',
        borderWidth: 2,
    }
});
const assetsStyle = StyleSheet.create({

    AddButton: {
        flexDirection: 'row',
        padding: 10,

    },
    ImportButton: {
        flexDirection: 'row',
        padding: 10
    },
    AssetToolView1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    AssetToolView2: {
        flexDirection: 'row'
    },
    GenericHeaderMainView: {
        flex: 1, alignSelf: 'stretch',
        flexDirection: 'row'
    },
    GenericHeaderView: {
        flex: 1, alignSelf: 'stretch'
    },
    GenericHeaderText: {
        fontSize: 12
    },

    GenericHeaderView: {
        flex: 1, alignSelf: 'stretch'
    },
    GenericHeaderTextView: {
        fontSize: 12
    },
    ScrollView: {
        padding: 10
    },
    AddNewAsset: {
        flexDirection: 'row', padding: 10,
        margin: 5, justifyContent: 'space-between'
    },
    AddNewAssetText: {
        color: '#2D0D5F',
        fontWeight: 'bold',
        fontSize: 16
    },
    ListAccordion: {
        flexDirection: 'row'
    },
    ListAccordionText: {
        color: 'black', padding: 10
    },
    ListAccordionSStyle: {
        alignContent: 'stretch'
    },
    MainView: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 10, margin: 5
    },
    ChildView: {
        flexDirection: 'row',
    },
    TextView1: {
        flexDirection: 'row', paddingLeft: 10,
        paddingRight: 10
    },
    TextView2: {
        // paddingLeft: 10,
        color: '#2D0D5F'
    },
    TextView3: {
        flexDirection: 'row', paddingLeft: 10
    },
    TextView4: {
        // paddingLeft: 10,
        color: '#2D0D5F'
    },
    walletList: {
        alignContent: 'stretch'
    },
    walletListText1: {
        flexDirection: 'row'
    },
    walletListText2: {
        color: 'black', padding: 10
    },
    walletListView: {
        marginBottom: 100
    },

});