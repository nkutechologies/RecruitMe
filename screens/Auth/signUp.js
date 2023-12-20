import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import colors from '../../tools/color';
import MyCheckBox from '../../components/CheckBox';
import auth from '@react-native-firebase/auth';
import axios from 'axios';
import URL from '../../tools/URL';
import {ActivityIndicator} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
export default function SignUp({navigation}) {
  const [cash, setcash] = useState(false);
  const [name, setname] = useState('');
  const [Password, setPassword] = useState('');
  const [phone, setphone] = useState('');
  const [email, setemail] = useState('');
  const [loader, setloader] = useState(false);
  const [Terms, setTerms] = useState(false);
  const [FBToken, setFirebaseToken] = useState();

  useEffect(() => {
    PushNotification.configure({
      onRegister: function (token) {
        setFirebaseToken(token.token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  }, []);

  const userSignup = async () => {
    setloader(true);
    var x = 6; // can be any number
    var rand = Math.random() * x + 1000;
    const myemail = 'test1' + rand + '@gmail.com';
    const mypassword = '7250043';
    //  alert(myemail)
    //  alert(mypassword)

    try {
      const result = await auth().createUserWithEmailAndPassword(
        myemail,
        mypassword,
      );
      firestore().collection('users').doc(result.user.uid).set({
        email: email,
        uid: result.user.uid,
        status: 'online',
      });

      const formdata = new FormData();
      formdata.append('name', name);
      formdata.append('firebase_email', myemail);
      formdata.append('email', email);
      formdata.append('notification_token', FBToken);
      formdata.append('password', mypassword);
      formdata.append('uid', result.user.uid);

      axios
        .post(URL + '/user-register', formdata)
        .then(async response => {
          setloader(false);
          if (response.data.status == 200) {
            await AsyncStorage.setItem(
              'AuthToken',
              response.data.successData.user.accessToken,
            );
            await AsyncStorage.setItem(
              'User',
              JSON.stringify(response.data.successData.user),
            );
            navigation.navigate('NumberVerify', {
              code: JSON.stringify(response.data.successData.code),
              name: response.data.successData.user.name,
              user: response.data.successData.user,
            });
            setloader(false);
            Toast.show(response.data.message);

            //    navigation.navigate('Login');
          } else {
            Toast.show(response.data.message);
          }
        })
        .catch(error => {
          Toast.show(error.response.data.message);
          setloader(false);
        });

      //  alert('Successfully Registered')
      setloader(false);
    } catch (err) {
      alert(err);

      setloader(false);
      // alert('some thing wrong')
    }
  };
  // hassan.ali@prismecs.com

  return (
    <ScrollView>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {/* <Image source={require('../../assets/newlogo.png')} resizeMode={'contain'} style={{height:hp(20),marginTop:hp(2),width:wp(20)}} /> */}
        <Image
          source={require('../../assets/recruitme_icon.png')}
          resizeMode={'contain'}
          style={{
            height: hp(18),
            alignSelf: 'center',
            top: 20,
            bottom: 20,
            width: wp(20),
          }}
        />

        <View style={Style.Container}>
          <Text style={Style.mainText}>Welcome</Text>
          <Text style={Style.txt}>Please Signup to your account</Text>

          <View style={{marginTop: hp(5)}}>
            <Text style={Style.txt}>Name</Text>
            <TextInput
              style={Style.inputview}
              placeholderTextColor={'#dedede'}
              placeholder={'Enter Name'}
              onChangeText={text => setname(text)}
              value={name}
            />
          </View>
          {/* <View style={{marginTop:hp(2)}} >
                <Text style={Style.txt}>Mobile Number</Text>
                    <TextInput style={Style.inputview}
                     placeholderTextColor={'#dedede'} 
                     placeholder={'+92..'}
                     keyboardType={'name-phone-pad'}
                     onChangeText={(text)=>setphone(text)}
                     value={phone}
                      />
               </View> */}
          <View style={{marginTop: hp(2)}}>
            <Text style={Style.txt}>Email</Text>
            <TextInput
              style={Style.inputview}
              placeholderTextColor={'#dedede'}
              placeholder={'sample@***.com'}
              keyboardType={'email-address'}
              onChangeText={text => setemail(text)}
              value={email}
            />
          </View>

          <View style={{flexDirection: 'row',alignItems:'center', marginTop: hp(1)}}>
            <MyCheckBox
              Checked={cash}
              CheckedIcon={'dot-circle-o'}
              UncheckedIcon={'circle-o'}
              textStyle={{color: colors.white}}
              checkedColor={'white'}
              ContainerStyle={{marginLeft: -2}}
              btnPress={() => {
                setcash(!cash);
                setTerms(!Terms);
              }}
            />
            <View style={{flexDirection:"row",justifyContent:"center",height:25,alignItems:'center'}}>
            <Text style={{alignSelf: 'center',justifyContent:'center',alignItems:'center', color: colors.white}}>
              I Agree To 
            </Text>
            <TouchableOpacity  onPress={()=>navigation.navigate('TermsCondition')}><Text style={{color:'green',marginLeft:2}}>Terms & Condition</Text></TouchableOpacity>
            </View>

    
          </View>
          {Terms ? (
            <TouchableOpacity onPress={() => userSignup()} style={Style.btn}>
              {loader ? (
                <ActivityIndicator size={20} color={'white'} />
              ) : (
                <Text style={Style.btntxt}>SIGNUP</Text>
              )}
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <Text style={{color: colors.green}}>Already have an account? </Text>
          <Text
            onPress={() => navigation.navigate('Login')}
            style={{textDecorationLine: 'underline'}}>
            {' '}
            Login{' '}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const Style = StyleSheet.create({
  Container: {
    paddingHorizontal: wp(7),
    // height:hp(65),
    paddingVertical: hp(5),
    marginTop: 20,
    backgroundColor: colors.blue,
    borderRadius: 10,
  },
  mainText: {
    width: wp(40),
    fontFamily: 'raleway-bold',
    fontSize: wp(8),
    fontWeight: '700',
    marginTop: 20,
    color: colors.white,
    alignSelf: 'center',
  },
  txt: {
    width: '100%',
    fontSize: wp(4),
    marginTop: 5,
    color: colors.white,
    alignSelf: 'center',
    fontFamily: 'raleway-regular',
  },
  inputview: {
    height: hp(5),
    borderColor: colors.white,
    borderBottomWidth: 1,
    width: wp(80),
    color: colors.white,
    paddingLeft: 5,
  },
  btn: {
    height: 60,
    width: wp(55),
    backgroundColor: colors.black,
    marginTop: hp(4),
    alignSelf: 'center',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btntxt: {
    color: colors.white,
    fontSize: hp(2.5),
    fontWeight: '700',
    fontFamily: 'raleway-bold',
  },
});
