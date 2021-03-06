import React, { Component } from 'react';
import {
	Text,
	View,
	ImageBackground,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import Entypo from "react-native-vector-icons/Entypo";
import { connect } from 'react-redux'
import { login, checkLogin } from '../store/actions/UseAction';
import LoadingModal from '../Component/loading';

class Login extends Component {
	constructor(props){
		super(props);
		this.email = "";
		this.password = "";
	}

	async componentDidMount() {
		this.props.checkLogin();
	}

	UNSAFE_componentWillReceiveProps(nextProps){
		// if(nextProps.user.isSucces) {
		// 	this.refs['loading'].hideModal()
		// 	this.props.navigation.navigate("bottomScreen")
		// 	return false;
		// } else {
		// 	if(nextProps.user.isLoadding) this.refs['loading'].showModal()
		// 	if(nextProps.user.error) {
		// 		this.refs['loading'].hideModal()
		// 		alert(nextProps.user.error)
		// 	}
		// 	return true;
    // }
    if(nextProps.user.isLoadding) this.refs['loading'].showModal()
    else {
      this.refs['loading'].hideModal()
      if(nextProps.user.isSucces) {
        this.props.navigation.navigate("bottomScreen")
      } else {
        alert(nextProps.user.error)
      }
    }
	}
	SendRequestLogin = ()=>{
		this.props.login({
			email: this.email.trim(),
			password: this.password.trim(),
		})
	}
	
	render() {
		return (
			<View>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ImageBackground
					source={require('../Assets/Image/background.png')}
					style={styles.container}
				>
					<View style={{ width: "90%", alignSelf: "center", marginBottom: 30 }}>
						<Text style={styles.textconnect}>Connect with</Text>
						<View style={styles.button}>
							<TouchableOpacity style={{ flex: 1 }}>
								<Text style={[styles.fbgg, { marginLeft: 10 }]}>facebook</Text>
							</TouchableOpacity>
							<Entypo
								name="facebook-with-circle"
								style={styles.iconFacebook}
								size={40}
							/>
						</View>
						<View style={styles.button}>
							<TouchableOpacity style={{ flex: 1 }}>
								<Text style={[styles.fbgg, { marginLeft: 10 }]}>google</Text>
							</TouchableOpacity>
							<Entypo
								name="google--with-circle"
								style={[styles.iconFacebook, { color: "#DC4E41" }]}
								size={40}
							/>
						</View>
						<Text style={[styles.textconnect, { marginTop: 24 }]}>Or</Text>
						<View style={styles.block}>
							<TextInput
								// value={this.email}
								style={styles.input}
								placeholder="Email or username"
								placeholderTextColor="#F9A825"
								onChangeText={text=>{this.email = text}}
							/>
							<TextInput
								// value={this.password}
								secureTextEntry
								style={styles.input}
								placeholder="password"
								placeholderTextColor="#F9A825"
								onChangeText={text=>{this.password = text}}
							/>	

							<TouchableOpacity style={styles.buttonsignin} onPress={()=>this.SendRequestLogin()}>
								<Text style={styles.textsignin}>SIGN IN</Text>
							</TouchableOpacity>
							<View style={styles.group}>
								<TouchableOpacity
									onPress={() => this.props.navigation.navigate("signUpScreen")}
								>
									<Text style={styles.textconnect}>Create Account</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => this.props.navigation.navigate("ForgetPWScreen")}
								>
									<Text style={styles.textconnect}>Forget password</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ImageBackground>
			</TouchableWithoutFeedback>
			<LoadingModal ref="loading" />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: "100%",
		justifyContent: 'flex-end',
	},
	textconnect: {
		alignSelf: 'center',
		fontFamily: "Roboto",
		fontStyle: 'normal',
		fontSize: 16,
		lineHeight: 19,
		fontWeight: '300',
		color: "#C4C4C4",
	},
	button: {
		width: "100%",
		height: 50,
		flexDirection: 'row',
		alignItems: "center",
		borderRadius: 20,
		marginTop: 8,
		backgroundColor: '#4C4C4C'
	},
	iconFacebook: {
		width: 42,
		height: 42,
		borderRadius: 42,
		color: "#314E8C",
	},
	fbgg: {
		fontFamily: 'Roboto',
		fontStyle: 'normal',
		fontWeight: "300",
		fontSize: 14,
		lineHeight: 16,
		color: '#C4C4C4',
	},
	block: {
		width: '100%',
		backgroundColor: "#4C4C4C",
		borderRadius: 20,
		alignItems: 'center',
		marginTop: 25
	},
	input: {
		height: 44,
		width: "90%",
		backgroundColor: "#fff",
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 25,
	},
	buttonsignin: {
		width: "90%",
		height: 44,
		borderWidth: 1,
		borderColor: "#F9A825",
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 16,
	},
	textsignin: {
		fontFamily: "Roboto",
		fontStyle: "normal",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 16,
		color: '#F9A825'
	},
	group: {
		width: '90%',
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 23,
		marginBottom: 23,
	},
});

const mapStateToProps =  state => {
	return {
		user: state.user,
	}
}

const mapDispatchToProps = {
	checkLogin: checkLogin,
	login: login
}


export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Login)
