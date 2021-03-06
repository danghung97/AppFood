import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ApiService from '../store/axios/AxiosInstance';
import PATH from '../store/axios/Url';
import {connect} from 'react-redux';
import Icons from 'react-native-vector-icons/AntDesign';
import ModalFindUser from '../Component/messenger/modalFindUser';

class Mess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      user: '',
      arrMessenger: [],
    };
    this.email = '';
  }

  async componentDidMount() {
    this.getMessenger();
  }
  async getMessenger() {
    await AsyncStorage.getItem('arrayMessenger', (error, result) => {
      if (error) {
        // callback(null);
        return;
      } else {
        if (result) {
          this.setState({arrMessenger: JSON.parse(result)});
        }
      }
    });
  }

  sendRequestLoadRoom = async (friend, arrMessenger) => {
    const {user} = this.props.user;
    try {
      const reponse = await ApiService.post(PATH.TAKE_ROOM, {
        authid: user.ID,
        received: friend.ID,
      });
      if (reponse.data.status) {
        this.props.navigation.navigate('chatScreen', {
          roomId: reponse.data.rid,
          friend: friend,
          user: user,
          initMessage: reponse.data.arrayMessage,
        });
        let tempArr = arrMessenger.filter(rs => rs.ID !== friend.ID);

        let temp = tempArr.concat(friend);
        AsyncStorage.setItem('arrayMessenger', JSON.stringify(temp));
        this.setState({arrMessenger: temp});
      } else {
        alert(reponse.data.message);
      }
      this.refs.finduser.hideModal();
    } catch (error) {
      console.warn('load room failed: ', error);
    }
  };

  FindUser = async mail => {
    try {
      const response = await ApiService.post(PATH.FIND_USER, {
        email: mail,
      });

      if (response.data.status) {
        this.refs.finduser.catchUser(response.data.user);
        this.refs.finduser.showModal();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.warn('find user fail: ', error);
    }
  };

  render() {
    const {user} = this.props.user;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => this.props.navigation.navigate('ProfileScreen')}>
            <Image style={styles.avatar} source={{uri: user.avatar}} />
          </TouchableOpacity>
          <Text style={styles.name}>{user.name}</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            style={{
              width: '80%',
              padding: 5,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: 'black',
              marginLeft: 10,
              marginTop: 10,
            }}
            placeholder="Email..."
            placeholderTextColor="#F9A825"
            onChangeText={text => (this.email = text)}
          />
          <TouchableOpacity
            onPress={() => this.FindUser(this.email)}
            style={{marginLeft: 15}}>
            <Icons name="search1" size={30} />
          </TouchableOpacity>
        </View>
        <FlatList
          style={{marginTop: 10, marginLeft: 10}}
          data={this.state.arrMessenger}
          keyExtractor={item => `user ${item.ID}`}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                onPress={() =>
                  this.sendRequestLoadRoom(item, this.state.arrMessenger)
                }>
                <Image
                  style={{width: 50, height: 50, borderRadius: 25}}
                  source={{uri: item.avatar}}
                />
                <Text style={{ marginLeft: 10 }}>{item.email}</Text>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => {
            return <View style={{height: 10}} />;
          }}
        />
        <ModalFindUser
          ref="finduser"
          goChat={this.sendRequestLoadRoom}
          arrMessenger={this.state.arrMessenger}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  header: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#FFFFFF',
    elevation: 6,
    padding: 15,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  name: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    marginLeft: 20,
  },
  mess: {
    width: '100%',
    padding: 10,
  },
  search: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrapper: {
    height: 40,
    width: '80%',
    marginLeft: 10,
    borderWidth: 0.5,
    borderColor: 'black',
  },
  input: {
    height: 40,
    width: '100%',
  },
  result: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    width: '100%',
    borderColor: 'black',
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
  },
});

const mapStateToProps = state => {
  return {
    user: state.user,
  };
};

export default connect(
  mapStateToProps,
  null,
)(Mess);
