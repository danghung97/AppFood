import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import Project from './src/screens/Project';
import Wrapper from './src/navigation/WrapperNavigation'
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import { savenotifi } from './src/store/actions/UseAction'

class App extends Component {
    async componentDidMount() {
        setTimeout(()=>{
            SplashScreen.hide()
        }, 1000)
        this.checkPermission();
        this.createNotificationListeners();
    }

    componentWillUnmount() {
        this.notificationListener();
        this.notificationOpenedListener();
    }
    
    async createNotificationListeners() {
        /*
  * Triggered when a particular notification has been received in foreground
  * */
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            // this.showAlert(title, body);
        });

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const notification = notificationOpen.notification;
            const data = notification._data || {};
            this.props.savenotifi(data)
        });

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const action = notificationOpen.action;
            const { title, body } = notificationOpen.notification;
            // this.showAlert(title, body);
        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
        //process data message
            console.log(JSON.stringify(message));
        });
    }

    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken()
        } else {
            this.requestPermission()
        }
    }

    async getToken() {
        global.fcmToken = await AsyncStorage.getItem('fcmToken');
        if (!global.fcmToken) {
            global.fcmToken = await firebase.messaging().getToken();
            if (global.fcmToken) {
                await AsyncStorage.setItem('fcmToken', fcmToken)
            }
        }
    }

    async requestPermission() {
        try {
            await firebase.messaging().requestPermission()
            this.getToken()
        } catch (error) {
            console.log('Permission rejected')
        }
    }
    render(){
        if(this.props.user.user) {
          return <Project />
        }
        return <Wrapper />
    }
}

const mapStateToProps = state => {
  return{
    user: state.user
  }
}

const mapDispatchToProps = {
    savenotifi: savenotifi,
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(App)
