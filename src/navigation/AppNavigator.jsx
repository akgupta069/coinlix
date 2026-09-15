import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Loader from '../components/Loader';
import TabBar from './TabBar';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RewardCampaignScreen from '../screens/RewardCampaignScreen';
import RedeemCodeScreen from '../screens/RedeemCodeScreen';

import SpinWheelScreen from '../screens/games/SpinWheelScreen';
import QuizScreen from '../screens/games/QuizScreen';
import ScratchCardScreen from '../screens/games/ScratchCardScreen';
import TapBlastScreen from '../screens/games/TapBlastScreen';
import MemoryMatchScreen from '../screens/games/MemoryMatchScreen';
import CoinRunnerScreen from '../screens/games/CoinRunnerScreen';
import CaptchaScreen from '../screens/games/CaptchaScreen';
import PollScreen from '../screens/games/PollScreen';
import NumberRushScreen from '../screens/games/NumberRushScreen';
import BubblePopScreen from '../screens/games/BubblePopScreen';
import ColorMatchScreen from '../screens/games/ColorMatchScreen';
import WordScrambleScreen from '../screens/games/WordScrambleScreen';
import TrueFalseScreen from '../screens/games/TrueFalseScreen';
import EmojiRiddleScreen from '../screens/games/EmojiRiddleScreen';
import OddOneOutScreen from '../screens/games/OddOneOutScreen';
import ReflexTapScreen from '../screens/games/ReflexTapScreen';
import WhackAMoleScreen from '../screens/games/WhackAMoleScreen';
import BalloonBurstScreen from '../screens/games/BalloonBurstScreen';
import SequenceTapScreen from '../screens/games/SequenceTapScreen';
import SimonSaysScreen from '../screens/games/SimonSaysScreen';
import LuckyDiceScreen from '../screens/games/LuckyDiceScreen';
import CoinFlipScreen from '../screens/games/CoinFlipScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const GamesStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const stackScreenOptions = { headerShown: false };

// Registered under both Home and Games stacks so either tab's grid can
// navigate straight to a game and back.
export const GAME_ROUTES = [
  { name: 'SpinWheel', component: SpinWheelScreen },
  { name: 'Quiz', component: QuizScreen },
  { name: 'ScratchCard', component: ScratchCardScreen },
  { name: 'TapBlast', component: TapBlastScreen },
  { name: 'MemoryMatch', component: MemoryMatchScreen },
  { name: 'CoinRunner', component: CoinRunnerScreen },
  { name: 'Captcha', component: CaptchaScreen },
  { name: 'Poll', component: PollScreen },
  { name: 'NumberRush', component: NumberRushScreen },
  { name: 'BubblePop', component: BubblePopScreen },
  { name: 'ColorMatch', component: ColorMatchScreen },
  { name: 'WordScramble', component: WordScrambleScreen },
  { name: 'TrueFalse', component: TrueFalseScreen },
  { name: 'EmojiRiddle', component: EmojiRiddleScreen },
  { name: 'OddOneOut', component: OddOneOutScreen },
  { name: 'ReflexTap', component: ReflexTapScreen },
  { name: 'WhackAMole', component: WhackAMoleScreen },
  { name: 'BalloonBurst', component: BalloonBurstScreen },
  { name: 'SequenceTap', component: SequenceTapScreen },
  { name: 'SimonSays', component: SimonSaysScreen },
  { name: 'LuckyDice', component: LuckyDiceScreen },
  { name: 'CoinFlip', component: CoinFlipScreen },
];

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="RedeemCode" component={RedeemCodeScreen} />
      {GAME_ROUTES.map((route) => (
        <HomeStack.Screen key={route.name} name={route.name} component={route.component} />
      ))}
    </HomeStack.Navigator>
  );
}

function GamesStackScreen() {
  return (
    <GamesStack.Navigator screenOptions={stackScreenOptions}>
      <GamesStack.Screen name="GamesMain" component={GamesScreen} />
      {GAME_ROUTES.map((route) => (
        <GamesStack.Screen key={route.name} name={route.name} component={route.component} />
      ))}
    </GamesStack.Navigator>
  );
}

function WalletStackScreen() {
  return (
    <WalletStack.Navigator screenOptions={stackScreenOptions}>
      <WalletStack.Screen name="WalletMain" component={WalletScreen} />
      <WalletStack.Screen name="RewardCampaign" component={RewardCampaignScreen} />
    </WalletStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={stackScreenOptions}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Games" component={GamesStackScreen} />
      <Tab.Screen name="Wallet" component={WalletStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { authLoading, isLoggedIn, isGuest } = useAuth();
  const { hydrated } = useApp();

  if (authLoading || !hydrated) return <Loader />;

  return (
    <NavigationContainer>
      {isLoggedIn || isGuest ? <MainTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}
