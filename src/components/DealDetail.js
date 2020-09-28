import React, { Component } from 'react'
import { Text, View, Image, StyleSheet, ScrollView, TouchableOpacity, PanResponder, Animated, Dimensions, Button, Linking} from 'react-native'
import PropTypes from 'prop-types'

import {priceDisplay} from '../utils'
import ajax from '../ajax'

export default class DealDetail extends Component {
      imgXPos = new Animated.Value(0);

      imgPanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gs) => {
                  this.imgXPos.setValue(gs.dx)
            },
            onPanResponderRelease: (evt, gs) => {
                  this.width = Dimensions.get('window').width; 
                  if(Math.abs(gs.dx) > this.width * 0.4) {
                        const direction = Math.sign(gs.dx) //-1 for left, 1 for right
                        Animated.timing(this.imgXPos, {
                              toValue: direction* this.width,
                              duration: 250,
                              useNativeDriver: false
                        }).start(() => this.handleSwipe(-1 * direction))
                  }
                  else {
                        Animated.spring(this.imgXPos, {
                              toValue: 0, useNativeDriver: false
                        }).start();
                  }
            }
      });

      handleSwipe = (indexDirection) => {
            if(!this.state.deal.media[this.state.imageIndex + indexDirection]) {
                  Animated.spring(this.imgXPos, {
                        toValue: 0, useNativeDriver: false
                  }).start();
                  return;
            }


            this.setState((prevState) => ({ 
                  imageIndex: prevState.imageIndex + indexDirection
            }), () => {
                  //next img animation
                  this.imgXPos.setValue(indexDirection * this.width);
                  Animated.spring(this.imgXPos, {
                        toValue: 0, useNativeDriver: false
                  }).start();
            })
      }

      static propTypes = {
            initialDealData: PropTypes.object.isRequired,
            onBack: PropTypes.func.isRequired,
      }
      state = {
            deal: this.props.initialDealData,
            imageIndex: 0,
      }

      async componentDidMount() {
            const fullDeal = await ajax.fetchDealDetails(this.state.deal.key);
            this.setState({deal:fullDeal})
      }
      
      openDealUrl = () => {
            Linking.openURL(this.state.deal.url)
      }

      render() {
            const {deal} = this.state;
            return (
                  <ScrollView style={styles.deal}>
                        <TouchableOpacity onPress={this.props.onBack}>
                              <Text style={styles.back}>Back</Text>
                        </TouchableOpacity>

                        <Animated.Image 
                        {...this.imgPanResponder.panHandlers}
                        style={[{left: this.imgXPos}, styles.image]} source={{uri: deal.media[this.state.imageIndex]}} />
      
                        <View style={styles.detail}>
                              <Text style={styles.title}>{deal.title}</Text>

                              <View style={styles.footer}>
                                    <Text style={styles.cause}>{deal.cause.name}</Text>
                                    <Text style={styles.price}>{priceDisplay(deal.price)}</Text>
                              </View>
                        </View>
                        
                        {deal.user && (
                              <View style={styles.footer}>
                                    <Image source={{uri: deal.user.avatar}} style={styles.avatar} />
                                    <Text>{deal.user.name}</Text>
                              </View>
                        )}
                        

                        <View style={styles.desc}> 
                              <Text>{deal.description}</Text>
                              <Button title="Buy this Deal!" onPress={this.openDealUrl} />
                        </View>
                        
                  </ScrollView>
            )
      }
}

const styles = StyleSheet.create({

      back: {
            marginBottom: 5,
            color: '#22f',
            marginLeft: 10
      },
      
      image: {
            width: '100%',
            height: 150,
            backgroundColor: '#ccc'
      },

      detail : {
            borderColor: '#bbb',
            borderWidth: 1,
      },

      info: {
            padding: 10,
            backgroundColor: '#fff',
            borderColor: '#bbb',
            borderWidth: 1,
            borderTopWidth: 0,
      },

      title: {
            fontSize: 16,
            padding: 10,
            fontWeight: 'bold',
            backgroundColor: 'rgba(237, 149, 45, 0.4)',
      },

      footer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            marginTop: 15,
      },

      cause: {
            flex: 2,
      },

      price: {
            flex: 1,
            textAlign: 'right'
      },
      
      avatar: {
            width: 60,
            height: 60,
            borderRadius: 100,
      },

      desc: {
            borderColor: '#ddd',
            borderWidth: 1,
            borderStyle: "dotted",
            margin: 10,
            padding: 10
      },
})