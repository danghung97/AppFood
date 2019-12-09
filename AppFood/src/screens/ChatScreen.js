import React, {Component} from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions
} from 'react-native';

import Icons from 'react-native-vector-icons/Feather';
import Icons1 from 'react-native-vector-icons/AntDesign';
import Icons2 from 'react-native-vector-icons/FontAwesome';
import Icons3 from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import ImagePicker from 'react-native-image-crop-picker';
import { connect } from 'react-redux';
import ApiService from '../store/axios/AxiosInstance';
import PATH from '../store/axios/Url';
import SoundRecord from './ChatComponent/SoundPlayer';

class Chat extends Component {
  constructor(props){
    super(props);
    this.state = {
      message: props.navigation.getParam('initMessage') || [],
      Offset: 2,
      isRecord: false,
    }
    this.rid = props.navigation.getParam('roomId')
  }

  componentWillReceiveProps(nextProps) {
    this.receiveMessage(nextProps)
  }
  componentDidMount() {
    this.receiveMessage(this.props)
  }

  receiveMessage = (props) => {
    const messageOfRoom = props.socket.message.filter(
      msg => msg.rid === this.rid)
    if(messageOfRoom.length !== 0 && 
      _.get(messageOfRoom[0], 'ID', null) !== _.get(this.state.message[0], 'ID', null)){
      let temp = [{...messageOfRoom[0]}].concat(this.state.message)
      this.setState({message: temp})
    }
  }

  loadMoreMessage = async() => {
    try{
      const response =  await ApiService.post(PATH.LOAD_MORE_MSG, {
        offset: this.state.Offset,
        room_id: this.rid
      })
      if(response.data.status){
        if(response.data.arrayMessage.length === 0) return
        else {
          const temp = this.state.message.concat(response.data.arrayMessage)
          this.setState({ message: temp, Offset: this.state.Offset + 1 })
        }
      }
    }catch (error) {
      console.warn('load message fail: ', error)
    }
  }

  renderItem = (item, uri) => {
    const user = this.props.navigation.getParam('user')
    
    if(item.item.uid === user.ID){
      const showAvatar = item.index === 0 || 
      _.get(this.state.message[item.index-1], 'uid', null) !== user.ID 
      return(
        <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: 10}}>
          {item.item.type_message === 'image' ? 
          <Image style={{width: 200, height: 150}} source={{uri: item.item.message}} resizeMode="cover" /> :
          <View style={[styles.box, {backgroundColor: "#C1EEF7", borderBottomRightRadius: showAvatar ? 0 : 4}]}>
            <Text style={{color: 'black'}}>{item.item.message}</Text>
          </View>}
          {showAvatar && <View style={[ styles.triangleCorner, {borderTopColor: '#C1EEF7'} ]} />}
          {showAvatar && <Image style={[ styles.avatar ]}
            source={{ uri: user.avatar }} />}
          {!showAvatar && <View style={{ width: 30, height: 30, marginLeft: 10 }} />}
        </View>
      )
    }else {
      const showAvatar = item.index === 0 || 
      _.get(this.state.message[item.index-1], 'uid', null) === user.ID
      return(
        <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end', marginBottom: 10}}>
          {showAvatar && <Image style={[ styles.avatar ]} 
            source = {{ uri }} />}
          {showAvatar && <View style={[ styles.triangleCorner, 
            {borderTopColor: '#fff', transform: [
              {rotate: '180deg'}
            ]} ]} />}
          {!showAvatar && <View style={{width: 30, height: 30, marginRight: 10}} /> }
          {item.item.type_message === 'image' ? 
          <Image style={{width: 200, height: 150}} source={{uri: item.item.message}} resizeMode="cover" /> :
          <View style = {[styles.box, {backgroundColor: '#fff', borderBottomLeftRadius: showAvatar ? 0 : 4}]} >
            <Text style={{color: 'black'}}> {item.item.message} </Text>
          </View>}
        </View>
      )
    }
  }
  
  render(){
    const friend = this.props.navigation.getParam('friend')
    const user = this.props.navigation.getParam('user')
    return(
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={styles.avatar}>
            <Image style={styles.avatar} source={{uri: friend.avatar}} />
          </TouchableOpacity>
          <Text style={styles.name}>{friend.email}</Text>
          </View>
        </View>
        <FlatList
          style={styles.content}
          data={this.state.message}
          keyExtractor={item => `message ${item.ID}`}
          inverted
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          renderItem={(item) => this.renderItem(item, friend.avatar)}
          onEndReached={this.loadMoreMessage()}
          onEndReachedThreshold={0.1}
        />
        <View>
          <InputMessage
          navigation = {this.props.navigation}
          authId = {user.ID}
          rid = {this.rid}
          />
        </View>
      </View>
    )
  }
}

class InputMessage extends React.PureComponent{
  constructor(props){
      super(props);
      this.state={
          msg: "",
      }
  }
  sendMessage=(type, msg)=>{
    let newMessage = msg.trim()
    if(newMessage===''){
        return
    }
    const { authId, rid } = this.props
    const message = {
      uid: authId,
      rid,
      type_message: type,
      message: newMessage,
    }
    try{
        global.socket.send(JSON.stringify(message));
    } catch (error) {
        alert('send message failed: ' + error)
    }
    this.setState({msg: ""})
  }

  openImage = () => {
    ImagePicker.openCamera({
      width: 350,
      height: 300,
      cropping: true,
      mediaType: 'photo'
    }).then(async (image) => {
      try {
        const data = new FormData();
        let name = "image.png"
        if(image.mime === "image/jpeg") name = "image.jpg"
        data.append('file',{
          type: image.mime,
          uri: image.path,
          name,
        })
        const response = await ApiService.post(PATH.UPLOADING, {
          data
        })
        if(response.data.status){
          this.sendMessage('image', res.data.link)
        }else{
          alert(res.data.message)
        }
      }catch (error) {
        console.warn(error)
      }

    })
    .catch(err => {
      alert('open image error: ' + err)
    })
  }

  pickerImage = () => {
      ImagePicker.openPicker({
        width: 350,
        height: 300,
        cropping: true,
        mediaType: 'photo'
      }).then( async(image) => {
        try{
          const data = new FormData();
          let name = "image.png"
          if(image.mime === "image/jpeg") name = "image.jpg"
          data.append('file', {type: image.mime, uri: image.path, name})

          const response = await ApiService.post(PATH.UPLOADING, {
            data
          })
          if(response.data.status){
            this.sendMessage('image', res.data.link)
          }else{
            alert(res.data.message)
          }
        }catch (error) {
          console.warn(error)
        }
      })
      .catch(err => {
          alert('picker image error: ' + err)
      })
  }
  closeRecord = () => {
    this.setState({ isRecord: false })
  }
  render(){
    const { authId, rid } = this.props
    const { isRecord } = this.state
    return(
      <View>
        <View style={{flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5}}>
          <TouchableOpacity onPress={() => this.openImage()}>
            <Icons1 name="camera" size={25} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.pickerImage()}>
            <Icons1 name="picture" size={25} style={{marginLeft: 10}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({ isRecord: !isRecord })}>
            <Icons2 name="microphone" size={25} style={{marginLeft: 10}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.requestCall()}>
            <Icons name="phone-call" size={25} style={{marginLeft: 10}} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
            this.props.navigation.navigate('VideoCallScreen', {
              userId: authId,
              rid
          })}>
            <Icons1 name="videocamera" size={25} style={{marginLeft: 10}} />
          </TouchableOpacity>
        </View>
        <View style={{borderWidth: 1, borderColor: '#9FF7EF'}} />
        {!isRecord ? <View style={styles.send}>
          <TextInput
            value={this.state.msg}
            placeholder="message"
            onChangeText={text => this.setState({msg: text})}
            style={styles.input}
          />
          <TouchableOpacity onPress={()=>this.sendMessage('text', this.state.msg)} style={{marginLeft: 15}}>
            <Icons3 name="md-send" size={30} />
          </TouchableOpacity>
        </View> 
        : <SoundRecord closeRecord={this.closeRecord} />}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container : {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff'
  },
  header: {
    padding: 15,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#FFFFFF',

    elevation: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5, 
    borderColor: '#FFF',
    alignSelf: 'flex-end'
  },
  name: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    marginLeft: 20
  },
  content: {
    width: '100%',
    // height: 400,
    // flex: 1,
    backgroundColor: '#E5E5E5',
  },
  send: {
    width: '100%',
    padding: 10,
    borderTopWidth: 0.5,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    height: 44,
    width: "80%",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
    marginLeft: 10
  },
  box: {
    // borderWidth: 1,
    // borderColor: 'black', 
    // borderRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    maxWidth: Dimensions.get('screen').width * 0.6, 
    paddingHorizontal: 7,
    paddingVertical: 10, 
    minWidth: 20
  }, 
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderRightColor: 'transparent',
    transform: [
      {rotate: '270deg'}
    ]
    // borderTopColor: 'red'
  },
})

const mapStateToProps = state => {
    return {
        socket: state.socket
    }
}

export default connect(mapStateToProps, null)(Chat)