import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { MenuProvider } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input } from 'react-native-elements';
import React from 'react';
import CountryCode from './CountryCodes';
import {
    View,
    ImageBackground,
    Text, TextInput,
    TouchableHighlight,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Keyboard,
    StyleSheet,
    AsyncStorage,
    KeyboardAvoidingView,
    Image,
    SafeAreaView,
    //  StackNavigator,
} from 'react-native';
import { registerStyles } from './common/styles';
//import { StackNavigator } from 'react-navigation';
import Config from './common/Config';
import { header, handleErrorCode } from './common/helper';
import CheckBox from 'react-native-checkbox';
import services from './common/services';
import TimerCountdown from 'react-native-timer-countdown';
import Modal from "react-native-simple-modal";
import { Modal as NativeModal } from 'react-native';
import I18n from './i18n';
import { Platform, NativeModules } from 'react-native';
const { StatusBarManager } = NativeModules;

import SnackBar from 'react-native-snackbar-component';
import { ConnectivityRenderer } from 'react-native-offline';

var phoneNumberValidator = require('password-validator');

width = Dimensions.get('window').width;
height = Dimensions.get('window').height;

var schema = new phoneNumberValidator();
schema.has().symbols()

export default class RegisterScreen extends Config {
    Exclamation = <Icon name='exclamation-circle' size={18} color='red' />;
    Exclamation30 = <Icon name='exclamation-circle' size={30} color='red' />;
    CheckIcon = <Icon name='check' size={24} color='green' />
    InputCheckIcon = <Icon name='check' size={20} style={{ padding: 10 }} color='green' />

    STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

    static navigationOptions = {
        title: 'Register',
    };
    constructor(props) {
        super(props);
        this.inputRefs = {};
        console.log('screensize ', Dimensions.get('window').height, ' ', this.STATUSBAR_HEIGHT);
        this.state = {
            isConnected: true,

            langValue: false,

            emailModeSelected: true,

            handle: '',
            isHandleValid: false,

            counttryCodeSelected: '+86',

            verificationCodeSent: false,

            showCommonModal: false,
            commonModalMessage: '',

            showTermsWebModal: false,

            timeRemaining: 0,
            showTimer: false,
            chkFailed: false,
            usersName: '',
            isNameValid: false,

            referenceID: '',
            isRefIDValid: false,

            confirmationCode: '',
            isConfirmationcodeValid: false,

            passwordEditing: false,
            password: '',
            isPasswordValid: false,
            confirmPasswordEditing: false,
            confirmpassword: '',
            isConfirmpasswordValid: false,

            agreedTerms: false,
            isRegistrationSuccessful: false,

            showCreateAccountMessage: false,

            showPickerModal: false,
            pickerModalSelectedIndex: 43,

            //ON FOCUS RELATED
            isEmailInputFocused: false,
            isPhoneInputFocused: false,
            confirmationCodeInputFocused: false,
            isNameInputFocused: false,
            isRefidInputFocused: false,
            isConfirmationCodeInputFocused: false,
            isPasswordInputFocused: false,
            isConfirmPasswordInputFocused: false,

            //Responsive
            statusBarHeight: this.STATUSBAR_HEIGHT,
            //w: this.width,
            //h: this.height,
            isLandscape: false,
            scrollHeight: this.height
        };
        this.didMount = false;
        this.intervalId = -1;

    }
    componentWillUnmount() {
        this.didMount = false;
        clearInterval(this.intervalId);
    }
    async componentDidMount() {
        this.ifIsConnected.currentRouteName = "Register";
        this.didMount = true;
        this.poll(this);

        let _userAttr = await this.services._retrieveData("userAttribute");
        if (typeof _userAttr === null || !_userAttr) {
            this.setState({ selectedLanguageCode: "EN" })
        }
        else {
            _userAttr = JSON.parse(_userAttr);
            this.setState({ selectedLanguageCode: _userAttr.language });
        }
    }
    selectEmail() {
        if (this.state.verificationCodeSent) {
            this.setState({ showCommonModal: true, chkFailed: false, commonModalMessage: I18n.t('Verification code already sent!') });
        } else {
            this.setState({ emailModeSelected: true });
        }
    }
    selectPhone() {
        if (this.state.verificationCodeSent) {
            this.setState({ showCommonModal: true, chkFailed: false, commonModalMessage: I18n.t('Verification code already sent!') });
        } else {
            this.setState({ emailModeSelected: false });
        }
    }
    HandleInput = () => {
        if (this.state.emailModeSelected) {
            /*For Email input*/
            return (
                <TouchableOpacity style={[
                    registerStyles.inputOpacityParent,
                    { borderColor: this.state.isEmailInputFocused ? '#F08214' : 'transparent' }]}>
                    <TextInput
                        placeholder={I18n.t("Enter your email here")}
                        underlineColorAndroid={'transparent'}
                        keyboardType={'email-address'}
                        placeholderTextColor='#D4D4D4'
                        style={registerStyles.TextInputStyle}
                        onChangeText={(text) => { this.validateEmail(text) }}
                        onFocus={() => { this.setState({ isEmailInputFocused: true }) }}
                        onBlur={() => { this.setState({ isEmailInputFocused: false }) }}
                    ></TextInput>{this.state.isHandleValid ? this.InputCheckIcon : null}
                </TouchableOpacity>
            );
        } else {
            /*For Phone number input*/
            return (
                <TouchableOpacity style={[
                    registerStyles.inputOpacityParent,
                    { borderColor: this.state.isPhoneInputFocused ? '#F08214' : 'transparent' }]}
                >
                    <TouchableOpacity
                        style={[{
                            flexDirection: 'row',
                            backgroundColor: '#2D0D5F',
                            borderTopLeftRadius: 5,
                            borderBottomLeftRadius: 5,
                        }, { backgroundColor: this.state.isPhoneInputFocused ? '#F08214' : '#2D0D5F' }]}
                        onPress={() => this.setState({ showPickerModal: true, isPhoneInputFocused: true })}
                    >
                        <Icon
                            name='angle-down'
                            size={20}
                            style={{ padding: 10 }}
                            color='white'
                        />
                        <Text style={{ color: 'white', padding: 10 }}>
                            {CountryCode[this.state.pickerModalSelectedIndex].value}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder={I18n.t("Enter phone number")}
                        underlineColorAndroid={'transparent'}
                        keyboardType={'phone-pad'}
                        placeholderTextColor='#D4D4D4'
                        style={registerStyles.TextInputStyle}
                        onChangeText={(text) => { this.validatePhoneNumber(text) }}
                        onFocus={() => { this.setState({ isPhoneInputFocused: true }) }}
                        onBlur={() => { this.setState({ isPhoneInputFocused: false }) }}
                    ></TextInput>{this.state.isHandleValid ? this.InputCheckIcon : null}
                </TouchableOpacity>
            );
        }
    }

    GetConfirmation() {
        const self = this;
        const postUrl = this.authAPIBaseUrl + "/verify-code";
        let _payload = {
            handle: self.state.handle
        };

        if (this.state.isHandleValid && !this.state.verificationCodeSent) {
            {/*Calls api with a valid handle*/ }
            if (!this.state.emailModeSelected) {
                var x = this.state.counttryCodeSelected + this.state.handle;
                _payload = { handle: x };
            } else {
                _payload = {
                    handle: this.state.handle
                };
            }
            this.services.postData(postUrl, _payload)
                .then((response) => {
                    if (response.hasOwnProperty("error")) {
                        const resp = response = JSON.parse(response.error);
                        var error = handleErrorCode(resp.code);
                        self.setState({
                            verificationCodeSent: false,
                            showCommonModal: true,
                            chkFailed: true,
                            commonModalMessage: error
                        });
                    }
                    else {
                        self.setState({
                            verificationCodeSent: true,
                            showCommonModal: true, chkFailed: false,
                            commonModalMessage: I18n.t("Please check your email/phone for validation code")
                        });
                        self.startTimer();
                    }
                })
                .catch(err => {
                    var error = handleErrorCode(err.code);
                    self.setState({
                        verificationCodeSent: false,
                        showCommonModal: true,
                        chkFailed: true,
                        commonModalMessage: error
                    });
                });
        } else if (this.state.isHandleValid && this.state.verificationCodeSent) {
            this.setState({ showCommonModal: true, chkFailed: false, commonModalMessage: I18n.t('Verification code already sent!') });
        }
        else {

            this.setState({ showCommonModal: true, chkFailed: true, commonModalMessage: I18n.t('Invalid Email or Phone number!') });
        }
    }

    startTimer = async () => {
        x = this.state.emailModeSelected ? 300 : 60;
        let d = new Date();
        let startTimer = d.getTime();
        await this.services._storeData("startTimer", startTimer.toString());
        this.setState({ showTimer: true, timeRemaining: x });
        this.clock = setInterval(this.timer, 1000);
    }
    timer = async () => {
        if (this.state.timeRemaining <= 0) {
            clearInterval(this.clock);
            this.setState({ showTimer: false, timeRemaining: 0 });
            this.setState({
                showCommonModal: true,
                chkFailed: true,
                commonModalMessage: I18n.t('Verification code expired! Try again'),
                verificationCodeSent: false,
            });
        } else {
            let d = new Date();
            let currentTimer = d.getTime();
            let startTimer = await this.services._retrieveData("startTimer");
            let goneTime = Math.round((currentTimer - parseInt(startTimer)) / 1000);
            this.setState({ timeRemaining: x - goneTime > 0 ? x - goneTime : 0 });
            // this.setState({ timeRemaining: this.state.timeRemaining - 1 });
        }
    }
    Timer = () => {
        var sec = this.state.timeRemaining;
        var m = (sec / 60 | 0);
        var s = sec % 60;
        if (this.state.showTimer) {
            return (
                <View>
                    <Text style={registerStyles.textAboveTimer}>{I18n.t("We've sent you a code to mail above,")}</Text>
                    <Text style={registerStyles.textAboveTimer}>{I18n.t("Submit all info before the timer stops")} </Text>
                    <Text style={registerStyles.textAboveTimer}>{m} min {s} sec</Text>
                </View>
            );
        }
    }

    onSelectItem(i) {
        this.setState({
            pickerModalSelectedIndex: i,
            showPickerModal: false,
            counttryCodeSelected: CountryCode[i].value
        });
    }
    CountryCodePickerModal = () => {
        return (
            <Modal
                open={this.state.showPickerModal}
                offset={0}
                modalDidClose={() => this.setState({ showPickerModal: false })}
                style={registerStyles.countryCodePickerStyle}
            >
                <ScrollView style={registerStyles.countryCodeChildView}>
                    {
                        //this.phoneItems.map(
                        CountryCode.map(
                            (item, i) => {
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={registerStyles.shadowStyle}

                                        onPress={() => this.onSelectItem(i)}
                                    >
                                        <Text style={registerStyles.CountryCodeFontSize}>{item.label}</Text>
                                        <Text style={registerStyles.CountryCodeFontSize}>{item.value}</Text>
                                    </TouchableOpacity>
                                );
                            }
                        )
                    }
                </ScrollView>
            </Modal>
        );
    }
    termsWebView = () => {
        return (
            <Modal
                open={this.state.showTermsWebModal}
                modalDidClose={() => this.setState({ showTermsWebModal: false })}
                modalStyle={{
                    borderRadius: 20,
                    margin: 20,
                    padding: 10,
                    backgroundColor: "white",
                    shadowColor: '#f4f4f4',
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
                    alignItems: "center",
                    backgroundColor: 'white',
                    borderRadius: 40,
                    borderColor: 'white',
                    borderWidth: 2,
                    margin: 5,
                    padding: 5
                }}>
                    <Text style={{ fontWeight: 'bold' }} >{'\n'}TERMS AND CONDITIONS{'\n'}</Text>
                    <Text>

                        The Intellectual Property disclosure will inform users that the contents, logo and other visual media you created is your property and is protected by copyright laws.
                        A Termination clause will inform that users’ accounts on your website and mobile app or users’ access to your website and mobile (if users can’t have an account with you) can be terminated in case of abuses or at your sole discretion.
                       A Governing Law will inform users which laws govern the agreement. This should the country in which your company is headquartered or the country from which you operate your website and mobile app.
                    </Text>

                    {/* <WebView
                        source={{ uri: 'https://coinscious.io/' }}
                        style={{ marginTop: 20, height: 600, width: 400, flex: 1 }}
                    /> */}
                    <View style={{ paddingTop: 10, paddingBottom: 10 }}>
                        <TouchableOpacity style={registerStyles.commonModalOpacity}
                            onPress={() => {
                                this.signAgree(true);
                                this.setState({ showTermsWebModal: false });
                            }}>
                            <Text style={registerStyles.commonModalOkText}>{I18n.t("I Agree")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={registerStyles.commonModalOpacity} onPress={() => {
                            this.signAgree(false);
                            this.setState({ showTermsWebModal: false });
                        }}>
                            <Text style={registerStyles.commonModalOkText}>{I18n.t("Cancel")}</Text>

                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
        );
    }
    chkFailedRender() {
        var self = this;
        if (!self.state.chkFailed) {
            return (
                <View style={{ alignItems: "center", borderRadius: 10 }}>
                    <Image
                        source={require('../images/Success.png')}
                        style={{
                            resizeMode: 'contain',
                            width: 115,
                            height: 115,
                        }}
                    />
                    <View style={{ width: width, alignItems: "center" }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'green', margin: 10 }}>{I18n.t("Success!")}</Text>
                    </View>
                </View>);
        }
        else {
            return (
                <View style={{ alignItems: "center", borderRadius: 10 }}>
                    <Image
                        source={require('../images/Failed.png')}
                        style={{
                            resizeMode: 'contain',
                            width: 115,
                            height: 115,
                        }}
                    />
                    <View style={{ width: width, alignItems: "center" }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red', margin: 10 }}>{I18n.t("Failed!")}</Text>
                    </View>
                </View>);
        }

    }
    commonModal = () => {
        return (
            <Modal
                open={this.state.showCommonModal}
                modalDidClose={() => this.setState({ showCommonModal: false })}
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
                <View style={registerStyles.commonModalChildView}>

                    {this.chkFailedRender()}
                    <View>
                        <Text style={{ fontSize: 14, color: '#8F8F8F', textAlign: 'center', margin: 10 }}>{this.state.commonModalMessage}</Text>
                    </View>
                    <TouchableOpacity style={registerStyles.commonModalOpacity} onPress={() => {
                        this.commonModalClose();
                        // this.props.navigation.navigation("Login");
                    }}>
                        <Text style={{ fontSize: 16, padding: 10, fontWeight: 'bold', textAlign: 'center', width: 80, borderRadius: 50, color: '#2F0E5D' }}>{I18n.t("OK")}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
    commonModalClose = () => {
        if (this.state.isRegistrationSuccessful) {
            this.setState({ showCommonModal: false });
            this.SaveUserInfo();
            this.props.navigation.navigate('Login');
        } else {
            if (this.state.verificationCodeSent) {
                this.setState({ isNameInputFocused: true, });
                this.refs.nameInput.focus();
            }
            this.setState({ showCommonModal: false });
        }

    }
    SaveUserInfo = async () => {
        await AsyncStorage.setItem('currentLanguage', this.state.defaultLanguage);
    }

    /*Validations*/
    validateEmail = (text) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            this.setState({ handle: text, isHandleValid: false });
            return false;
        }
        else {
            this.setState({ handle: text, isHandleValid: true });
        }
    }
    validatePhoneNumber = (text) => {
        let reg = /^[0-9\b]+$/;
        if (reg.test(text) === false) {
            this.setState({ handle: text, isHandleValid: false })
            return false;
        }
        else {
            this.setState({ handle: text, isHandleValid: true })
        }
    }
    validateUsersName = (text) => {
        this.setState({ usersName: text, isNameValid: true });
    }
    validateRefID = (text) => {
        this.setState({ referenceID: text, isRefIDValid: true });
    }
    validateConfirmationCode = (text) => {
        if ((/^[0-9\b]+$/).test(text) && (/^.{4,6}$/).test(text)) {
            this.setState({ confirmationCode: text, isConfirmationcodeValid: true })
        }
        else {
            this.setState({ confirmationCode: text, isConfirmationcodeValid: false })
            return false;
        }
    }
    validatePassword = (text) => {
        this.setState({ passwordEditing: true });
        this.setState({ password: text });
        let reg = /^.{7,16}$/;
        if (
            /^.{8,16}$/.test(text) &&
            schema.validate(text) &&
            !(/([a-zA-Z0-9])\1\1\1+/g).test(text)
        ) {
            this.setState({ isPasswordValid: true });
        } else {
            this.setState({ isPasswordValid: false });
        }
    }
    validateConfirmPassword = (text) => {
        this.setState({ confirmPasswordEditing: true });
        this.setState({ confirmPasswordEditing: true, confirmpassword: text });
        if (this.state.isPasswordValid && text == this.state.password) {
            this.setState({ isConfirmpasswordValid: true });
        } else {
            this.setState({ isConfirmpasswordValid: false });
        }
    }
    toggle = () => {
        this.state.agreedTerms ? this.setState({ agreedTerms: false }) : this.setState({ agreedTerms: true });
    }
    signAgree = (val) => {
        this.setState({ agreedTerms: val });
    }
    TermsLinkPressed = () => {
        //this.setState({ showCommonModal: true, commonModalMessage: 'Terms and Conditions' });
        this.setState({ showTermsWebModal: true });
    }

    createAccount = () => {
        if (
            this.state.isPasswordValid &&
            this.state.isConfirmpasswordValid &&
            this.state.agreedTerms
        ) {
            if (this.state.showTimer) {
                this.submitToRegister();
            } else {
                this.setState({ showCommonModal: true, chkFailed: false, commonModalMessage: I18n.t('You need to get verification code again') });
            }
        } else {
            this.setState({ showCreateAccountMessage: true });
        }
    }
    submitToRegister = () => {
        const self = this;
        //this.setState({ open: true });
        const postUrl = this.authAPIBaseUrl + "/registration";
        if (!this.state.emailModeSelected) {
            var x = this.state.counttryCodeSelected + this.state.handle;
        } else {
            var x = this.state.handle
        }
        console.log("this.state.counttryCodeSelected:", this.state.counttryCodeSelected)
        let _payload = {
            language: self.state.selectedLanguageCode,
            code: self.state.confirmationCode,
            handle: x,
            name: self.state.usersName,
            password: self.state.password,
            refId: self.state.referenceID,
        };
        this.services.postData(postUrl, _payload)
            .then((response) => {
                if (response.hasOwnProperty("error")) {
                    var error = handleErrorCode(response.error.code);
                    this.setState({ showCommonModal: true, chkFailed: true, commonModalMessage: error });
                }
                else {
                    this.setState({
                        showCommonModal: true, chkFailed: false,
                        commonModalMessage: I18n.t("Your account created successfully!"),
                        isRegistrationSuccessful: true
                    });
                    //this.props.navigation.navigate('Login');


                }
            })
            .catch(err => {
                //self.setState({ requesting: false });

                this.setState({ showCommonModal: true, chkFailed: true, commonModalMessage: error });
            });
    }
    closeCrateAccountMessage = () => {
        this.setState({ showCreateAccountMessage: false });
    }
    calculateHeight = () => {
        return (
            Dimensions.get('window').height
            - this.STATUSBAR_HEIGHT
            - 80
        );
    }
    onRotation = (evt) => {
        if (evt.nativeEvent.layout.width > evt.nativeEvent.layout.height) {
            console.log('Landscape mama landscape');
            this.setState({
                isLandscape: true,
                scrollHeight: this.calculateHeight()
            });
        } else {
            console.log('portrait mama portrait');
            this.setState({
                isLandscape: false,
                scrollHeight: this.calculateHeight()
            });
        }
    }
    render() {
        const self = this;

        return self._render();

    }
    _render() {
        const self = this;
        return (
            <SafeAreaView style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} enabled

                >
                    {header(this, "", true)}
                    {this.showSnackBar(self, this.state.isConnected)}
                    <ImageBackground source={require('./../../assets/backImage.png')} style={registerStyles.container}>
                        {console.log(this.height + ' ' + this.STATUSBAR_HEIGHT)}
                        <ScrollView style={{ marginBottom: 100 }}
                        >

                            <View style={registerStyles.pageHeight} />
                            <Text style={registerStyles.contentHeader}>{I18n.t("Create account")}</Text>
                            <TouchableOpacity
                                style={registerStyles.languageOpacity}
                                onPress={() => this.setState({ langValue: true })}
                            >
                                <Text style={registerStyles.languagePickerText}>
                                    {I18n.t("Language") + "(" + self.state.selectedLanguageCode + ")"}
                                </Text>
                                <Icon
                                    name='angle-down'
                                    size={20}
                                    color='#2D0D5F'
                                />
                            </TouchableOpacity>

                            {/*Email or phone mode selector*/}
                            <View style={registerStyles.mailOrPhoneSelector}>
                                <TouchableHighlight
                                    style={
                                        this.state.emailModeSelected ?
                                            registerStyles.handleButton_OnSelectStyle
                                            :
                                            registerStyles.handleSelectButton
                                    }
                                    onPress={() => { this.selectEmail() }}
                                >
                                    <Text style={registerStyles.touchText}>{I18n.t("Email")}</Text>
                                </TouchableHighlight>

                                <Text style={registerStyles.orText}>{I18n.t("or")}</Text>

                                <TouchableHighlight
                                    style={
                                        this.state.emailModeSelected ?
                                            registerStyles.handleSelectButton
                                            :
                                            registerStyles.handleButton_OnSelectStyle
                                    }
                                    onPress={() => { this.selectPhone() }}
                                >
                                    <Text style={registerStyles.touchText}>{I18n.t("Phone Number")}</Text>
                                </TouchableHighlight>
                            </View>

                            <View>
                                {this.HandleInput()}

                                {/* {this.LanguageSelector()} */}

                                <View style={{ paddingTop: 35 }}></View>
                                <TouchableHighlight
                                    style={[registerStyles.submit, { borderColor: this.state.isHandleValid ? '#F08214' : '#3c1e55' }]}
                                    onPress={() => { this.GetConfirmation() }}>
                                    <Text style={[registerStyles.confirmationTouchableText, { color: this.state.isHandleValid ? '#F08214' : '#3c1e55' }]}>{I18n.t("GET CONFIRMATION CODE")}</Text>
                                </TouchableHighlight>

                                {this.Timer()}

                                <View style={{ marginTop: 30 }}></View>

                                <TouchableOpacity style={[
                                    registerStyles.inputOpacityParent,
                                    { borderColor: this.state.isNameInputFocused ? '#F08214' : 'transparent' }]}
                                    ref='nameinputBorer'
                                >
                                    <TextInput
                                        placeholder={I18n.t("Name")}
                                        underlineColorAndroid={'transparent'}
                                        keyboardType={'default'}
                                        placeholderTextColor='#D4D4D4'
                                        style={registerStyles.TextInputStyle}
                                        onChangeText={(text) => { this.validateUsersName(text) }}
                                        editable={this.state.verificationCodeSent}
                                        ref='nameInput'
                                        onSubmitEditing={() => this.refs.referencIdInput.focus()}
                                        //onSubmitEditing={()=>this.refs.referencIdInput.hide()}
                                        //onFocus={() => { this.setState({ isNameInputFocused: true }) }}
                                        onFocus={() => { this.refs.nameinputBorer.props.style.borderColor = 'red' }}
                                        onBlur={() => { this.setState({ isNameInputFocused: false }) }}
                                    ></TextInput>{this.state.isNameValid ? this.InputCheckIcon : null}
                                </TouchableOpacity>

                                <TouchableOpacity style={[
                                    registerStyles.inputOpacityParent,
                                    { borderColor: this.state.isRefidInputFocused ? '#F08214' : 'transparent' }]}>
                                    <TextInput
                                        placeholder={I18n.t("Reference ID")}
                                        underlineColorAndroid={'transparent'}
                                        placeholderTextColor='#D4D4D4'
                                        ref='referencIdInput'
                                        onSubmitEditing={() => this.refs.confirmationCodeInput.focus()}
                                        style={registerStyles.TextInputStyle}
                                        onChangeText={(text) => { this.validateRefID(text) }}
                                        onFocus={() => { this.setState({ isRefidInputFocused: true }) }}
                                        onBlur={() => { this.setState({ isRefidInputFocused: false }) }}
                                    ></TextInput>{this.state.isRefIDValid ? this.InputCheckIcon : null}
                                </TouchableOpacity>

                                <TouchableOpacity style={[
                                    registerStyles.inputOpacityParent,
                                    { borderColor: this.state.isConfirmationCodeInputFocused ? '#F08214' : 'transparent' }]}>
                                    <TextInput
                                        placeholder={I18n.t("Enter confirmation code")}
                                        underlineColorAndroid={'transparent'}
                                        keyboardType={'phone-pad'}
                                        placeholderTextColor='#D4D4D4'
                                        ref='confirmationCodeInput'
                                        onSubmitEditing={() => this.refs.passwordInput.focus()}
                                        style={registerStyles.TextInputStyle}
                                        onChangeText={(text) => { this.validateConfirmationCode(text) }}
                                        onFocus={() => { this.setState({ isConfirmationCodeInputFocused: true }) }}
                                        onBlur={() => { this.setState({ isConfirmationCodeInputFocused: false }) }}
                                    ></TextInput>{this.state.isConfirmationcodeValid ? this.InputCheckIcon : null}
                                </TouchableOpacity>

                                <TouchableOpacity style={[
                                    registerStyles.inputOpacityParent,
                                    { borderColor: this.state.isPasswordInputFocused ? '#F08214' : 'transparent' }]}>
                                    <TextInput
                                        placeholder={I18n.t("Password")}
                                        underlineColorAndroid={'transparent'}
                                        secureTextEntry={true}
                                        placeholderTextColor='#D4D4D4'
                                        ref='passwordInput'
                                        onSubmitEditing={() => this.refs.confirmPasswordInput.focus()}
                                        style={registerStyles.TextInputStyle}
                                        onChangeText={(text) => { this.validatePassword(text) }}
                                        onFocus={() => { this.setState({ isPasswordInputFocused: true }) }}
                                        onBlur={() => { this.setState({ isPasswordInputFocused: false }) }}
                                    ></TextInput>{this.state.isPasswordValid ? this.InputCheckIcon : null}
                                </TouchableOpacity>

                                <View>{
                                    this.state.passwordEditing && !(/^.{7,16}$/.test(this.state.password)) ?
                                        <Text style={registerStyles.validationHints}>{this.Exclamation}  {I18n.t("Length must be 8-16")}</Text> : <View></View>
                                }
                                </View>

                                <View>{
                                    this.state.passwordEditing && !schema.validate(this.state.password) ?
                                        <Text style={registerStyles.validationHints}>{this.Exclamation}  {I18n.t("Symbols needed")}</Text> : <View></View>
                                }
                                </View>

                                <View>{
                                    this.state.passwordEditing && (/([a-zA-Z0-9])\1\1\1+/g).test(this.state.password) ?
                                        <Text style={registerStyles.validationHints}>{this.Exclamation}  {I18n.t("4 repeating chars not allowed")}</Text> : <View></View>
                                }
                                </View>

                                <TouchableOpacity style={[
                                    registerStyles.inputOpacityParent,
                                    { borderColor: this.state.isConfirmPasswordInputFocused ? '#F08214' : 'transparent' }]}>
                                    <TextInput
                                        placeholder={I18n.t("Confirm Password")}
                                        underlineColorAndroid={'transparent'}
                                        secureTextEntry={true}
                                        placeholderTextColor='#D4D4D4'
                                        ref='confirmPasswordInput'
                                        style={registerStyles.TextInputStyle}
                                        onChangeText={(text) => { this.validateConfirmPassword(text) }}
                                        onFocus={() => { this.setState({ isConfirmPasswordInputFocused: true }) }}
                                        onBlur={() => { this.setState({ isConfirmPasswordInputFocused: false }) }}
                                    ></TextInput>{this.state.isConfirmpasswordValid ? this.InputCheckIcon : null}
                                </TouchableOpacity>

                                <View>{
                                    this.state.confirmPasswordEditing && !this.state.isConfirmpasswordValid ?
                                        <Text style={registerStyles.validationHints}>{this.Exclamation} {I18n.t("Password didn't match!")}</Text> : <View></View>
                                }
                                </View>

                                <View style={registerStyles.termsCheckbox}>
                                    <CheckBox
                                        value={this.state.agreedTerms}
                                        checked={this.state.agreedTerms}
                                        label={I18n.t("I Accept the")}
                                        labelStyle={registerStyles.checkbox_terms_text}
                                        checkboxStyle={registerStyles.checkbox_terms_teak}
                                        onChange={() => this.setState({ agreedTerms: !this.state.agreedTerms })}
                                    />
                                    <Text
                                        style={registerStyles.termsLinkText}
                                        onPress={this.TermsLinkPressed}
                                    >
                                        {I18n.t("Terms and Conditions")}
                                    </Text>
                                </View>

                                <TouchableHighlight
                                    style={registerStyles.submit}
                                    onPress={() => { this.createAccount() }}
                                >
                                    <Text style={registerStyles.createAccountText}>{I18n.t("CREATE ACCOUNT")}</Text>
                                </TouchableHighlight>
                            </View>
                            <View style={{ marginBottom: 40 }}>
                            </View>
                        </ScrollView>

                        {/*Create account message*/}
                        <Modal
                            open={this.state.showCreateAccountMessage}
                            modalDidClose={this.closeCrateAccountMessage}
                            modalStyle={{
                                borderRadius: 20,
                                margin: 20,
                                padding: 10,
                                backgroundColor: "white",
                                shadowColor: '#c5c1c8',
                                shadowOffset: { width: 0, height: 5 },
                                shadowOpacity: 0.8,
                                shadowRadius: 25,
                                elevation: 25,
                                height: '40%',
                            }}
                            overlayStyle={{
                                backgroundColor: "white",
                                flex: 1
                            }}

                        >
                            <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                <View style={{ paddingTop: 15, alignItems: 'center', backgroundColor: 'transparent' }}>{this.Exclamation30}</View>

                                <View style={registerStyles.createAccountModalChildView}>

                                    <View>{
                                        !this.state.isHandleValid ?
                                            <Text style={registerStyles.createAccountModalText}>{I18n.t("Email or Phone Number not valid")}</Text> : <View></View>
                                    }
                                    </View>
                                    <View>{
                                        !this.state.isPasswordValid ?
                                            <Text style={registerStyles.createAccountModalText}>{I18n.t("Password is not valid")}</Text> : <View></View>
                                    }
                                    </View>
                                    <View>{
                                        !this.state.isConfirmpasswordValid ?
                                            <Text style={registerStyles.createAccountModalText}>{I18n.t("Confirm password didn't match!")}</Text> : <View></View>
                                    }
                                    </View>
                                    <View>{
                                        !this.state.agreedTerms ?
                                            <Text style={registerStyles.createAccountModalText}>{I18n.t("You must agree terms!")}</Text> : <View></View>
                                    }
                                    </View>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'center', margin: 5, height: 40, borderRadius: 30, backgroundColor: "#e8e5e5", width: '36%', }}>
                                    <TouchableOpacity onPress={this.closeCrateAccountMessage}>
                                        <Text style={{ paddingBottom: 3, color: "#707070", fontWeight: 'bold', fontSize: 16 }}>{I18n.t("OK")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        <View>
                            <NativeModal
                                animationType="slide"
                                transparent={false}
                                visible={self.state.langValue}
                                onRequestClose={() => {
                                    this.setState({ langValue: false })
                                }}>
                                <View>
                                    {header(this, "Language", true, "langValue")}
                                    {self._renderModalContentLang(self.services.language)}
                                </View>
                            </NativeModal>
                        </View>

                        {this.termsWebView()}
                        {this.commonModal()}
                        {this.CountryCodePickerModal()}

                    </ImageBackground>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}