import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  FlatList,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import spadeImage from './spade.jpg';
import clubImage from './club.jpg';
import diamondImage from './diamond.jpg';
import heartImage from './heart.jpg';
import {Dimensions} from 'react-native';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTheme} from '.././ThemeContext';

var roomId = '';
var name = '';
var roomMembers = [];
var partner = '';
var membersYouCanAsk = [];
var yourPosition;
var cards = [];
var totalPoints;
var pointsMessage = [];
var endResult = [];
var partnerCards = [];
var gameSelected = '';
var onGoingSuitOfTheRound = '';
var roundOrder = [];
var cardDeliveredInOrder = [];
var gameCompletedOrderList = [];
var jackandfiveCaptureList = [];

export default function HomePage() {
  const {theme} = useTheme();

  let gamesList = ['Memory', 'Ace', 'JackAndFive'];
  const MemoryRules = [
    'This Game Can be Played Exactly with 4 or 6 or 8 palyers only .',
    'If you Play with 4 players only there is no teams every one is an Individual Player .',
    'If you Play with 6 or 8 Players 2 Players will be assigned to one team .',
    'If it is a 6 player Game then there are 3 Teams If it is a 8 Player Game then there are 4 Teams .',
    'Every Game Consists of 8 Bases . The Player or a Team will be Ordered as 1 2 3 or 4 According to Number of Bases they Captured at the End of The Game .',
    '8 Bases: From 2 to 7 of Spade is one base , From 9 to A of Spade is one base , From 2 to 7 of Club is one base , From 9 to A of Club is one base , From 2 to 7 of Diamond is one base , From 9 to A of Diamond is one base , From 2 to 7 of Heart is one base , From 9 to A of Heart is one base .',
    'The card 8 from each Suit will not be in game .',
    'Host(Room Creator) Will Start The Game .',
    'A Player can ask a Card to any Player but he should have atleast one card at that base .',
    "If a player called Hari is asking 5Club to Archu, Hari should have atleast any one of the card between 2 to 7 of Clubs even it can be 5Club also . But he cannot ask without a base card. And If Archu has that Card That Card will be removed from Archu's lot and added to Hari's lot. And Hari can continue asking another card to Archu or any other Player also with the same rules appicable until Hari's attempt is wrong . After Hari's attempted is wrong the next player will have the chance to play with all the same Scenarios . This will carry on in a Cyclic way .",
    'If an Individual or as a Team if they captured all the seven cards in a base that base has been captured by them and they will be alloted 1 point .',
    "A Player is consider to be out of the game only if he/she dosen't have any cards left with him .",
    'All the onGoing Moves like Hari is asking 5Club to Archu and weather his attempt is Success will be announced to all Players .',
    "If a Player's attempt is Fail the round will be moved to next Player you can identify that the Player's attempt is fail and the card he asked to whom will also be announced .",
    'EveryOne will be able to see Which Player is Playing and what card he is asking and to whom he is asking .',
    'You can ask as many cards you can ask to whom ever you want until you get a fail Guess . But for one attempt you can ask one card only .',
    'A Base is considered to be captured even if you have 2 4 5 and 7 of spades and your TeamMate have rest of the two spades that is 3 and 6 of spades .',
    "This Game will increase you Memory skills by a lot by remembering who has which card and sometimes if you don't know who has the card you want you have to play a silent game beacause you would have Collected 4 out of 6 cards apart from your base card from different player and suddenly a player with that one card will come and steal all those 5 cards with your base card from you and will capture the round this will happen a lot of times... Sometimes Silence is a key to success .",
    "Just don't play all your turns for capturing a single base alone just confuse the players by asking for different base of cards rest all players will not come to know in base you have dominant of cards .",
    'Sometimes in rare cases it is good that you can ask the card you have with yourself to other player so that they will understand that you dont have that card .',
    'This game is basically like you have to comeout exactly at right moment and just focus on all the calls in which you have a base card beacuse 1 card can bring you 1 full base capture .',
  ];
  const AceRules = [
    'This Game Can be Played with 2 to 8 Players .',
    'This Game is focused Completly on who is the Ace Called as Losser.',
    'The card machine will start putting the card from Host(Room Creator) in a Cyclic Manner . Sometimes EveryBody will have same number of cards but the count of cards from on to another player will defer a max by only one card .',
    'Host(Room Creator) Will Start The Game .',
    'The Ranking order from high to low is from A k Q J 10 ...... 2',
    'If a Player is Starting that Round he can put any card he has with him .',
    'But once that round has been initiated by a player everyone next should continue to put the card in the same symbol with high or low number',
    "If you dosen't have the suit (Symbol) that was initiated by a player you can cut that round by cutting with any of the card you have at your turn only . And Players next to you in a cyclic path cannot play on that round .",
    'A round is considered as finished only if for example (5 players are all 5 players have putted cards in that round or if it was cutted by someone Inbetween) . ',
    'If all Players putted cards in a round the person who put the highest of the rank should start the next round . And all those cards will go out of the game .',
    'If Someone cuts Inbetween means the person Who has putted the highest rank card of that round should take all cards of that round till the cut has happen including the cut card . And it will be added in his lot',
    'If a Player Completes all his cards he has escaped from becoming an Ace .',
    'And atlast while 2 players are playing if both players completes thier respective cards at same round means there is no Ace . Otherwise the last one who is still having cards or card will be named as Ace . ',
    'This Game will increase you Memory skills a bit And your Smartness a more .',
  ];
  const JackAndFiveRules = [
    'This Game Can be Played with Exactly 4 Players only .',
    'In This four Players it will splitted into 2 players in each team .',
    'The Cyclic order is like teamA Player followed by TeamB Player followed by a TeamA Player and followed by a TeamB Player .',
    'The Team which is having more points at the end of the game is winner .',
    'This Game is round based game in which all players will contribute one card per round and total of 13 rounds .',
    'The Team who is capturing the round will be given one point per round . And as per the name of the game suggest Jack and five of all the Suit(Symbol) has a special Power it will be mentioned in following Points .',
    'The Host(Room Creator) will start the game with any card he has with him .',
    'The Game will continue in cyclic path',
    'All The other Players should have to put a card with the same Suit which was Initiated by the first player of that particular round',
    "If a Player dosen't have any card in the Suit which was initiated by first player of the round he can cut the round with any card he has with him and the round will continue with a same Cyclic path without stopping .",
    'If EveryOne in that round has putted the same Suit Initiated by the first player of that round the person who has putted largest rank of that suit that team will be awarded 1 point .',
    'If the round is cutted by only one player that team will be awarded a point , If many Players cut the same round the person who cutted with biggest rank of card will be awarded a point ,  if two or more players cutted with same rank of card the Suit priority from high to low is (Spade ,Club ,Diamond and heart) which means that with a Player cuts a rount with 8Spade and another player cuts the same round with 8Diamond the player who cutted with 8Spade will be awarded a point .',
    'The Person Who Won the round will Start the next round .',
    "Now the role of the jacks and five's is crucial in the main aim of your team is to be capturing the jack's and not capturing the five's . ",
    'For Every jack you capture as a team your team will be awarded +10 points and for every five you capture as a team will be detucted -5 points .',
    'Sample Scenario for jack capturing : If a Player from A team puts 8 Diamond and Player from B team puts J Diamonds and the next Player from A team puts K Diamonds and next Player from B team puts 3 Diamond means, since that round hase been captured by the player who puts K Diamond that team will be awarded 1 point and since the round he captured has involved J in it that team will be awarded 10 points and he will start the next round which is basic rule . ',
    "This Same Scenario will be satisfied for five capturing also , if a Player from A team puts 5Spade and Player from B team puts 6Spade and Player from A team does not have any spade below 6 so he is putting kSpade and Player from B team puts 10Spade means , since a Player from team A win's that round that team will be awarded +1 point and the round he captured has 5 in it that team be will detucted -5 points .",
    'If both Jack and Five scenario involves in a same round they will undergo both this +10 and -5 point System and round capturing point also .',
    'If the round which got cutted by one or two or more players cotains jack or five or both the same +10 and -5 will be applicable to the team who won that round on the basis of cut rules scenario .',
    'If You got a cut oppurtunity can cut a round with jack or five also there is no restriction in that .',
    'So your basic aim to capture the jacks and not to capture the five and play according to the situation of the game smartly .',
    'The main logic is playing as a team . Sample : If team A player puts 8Heart and team B player put 10Heart and team A player put 4Heart and now if it your turn means even if you have QHeart you need not put as the round is already captured by you teamMate so if you have AnyOther Heart less then 10 but not 5Heart 😁 you can put that . If you not have less than 10 but greater than that only means then no problem you are supposed to put that only as you have Haert .',
    "Similary you should try to make the 5's capture by Your opponent team and jack's to be captured by your team .",
    'Play as a Team it will be a fun fill game .',
  ];
  const [rulesScreen, setRulesScreen] = useState(false);
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [enteredRoomId, setEnteredRoomId] = useState('');
  const [enteredName, setEnteredName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [message, setMessage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [playerToBeKicked, setPlayerToBeKicked] = useState('');
  const [gameSelectionScreen, setGameSelectionScreen] = useState(false);
  const [activeGameTab, setActiveGameTab] = useState(null);

  const [gameScreen, setGameScreen] = useState(false);
  const [turnMessage, setTurnMessage] = useState('');
  const [yourTurn, setYourTurn] = useState(false);
  const [yourCards, setYourCards] = useState([]);
  const [viewCardsScreen, setViewCardsScreen] = useState(false);
  const [roundInfoScreen, setRoundInfoScreen] = useState(false);
  const [fromPerson, setFromPerson] = useState('');
  const [toPerson, setToPerson] = useState('');
  const [responseForTheCard, setResponseForTheCard] = useState('');
  const [askedCardRank, setAskedCardRank] = useState('');
  const [askedCardSuit, setAskedCardSuit] = useState('');
  const [endGameScreen, setEndGameScreen] = useState(false);

  const toggleKickPlayerDialogModal = () => {
    setModalVisible(!isModalVisible);
    if (playerToBeKicked !== '') {
      setPlayerToBeKicked('');
    }
  };

  // Establish a WebSocket connection when the component mounts
  const ws = new WebSocket('wss://game-server-production-dfa9.up.railway.app');

  const minorSpades = [
    '2 of Spades',
    '3 of Spades',
    '4 of Spades',
    '5 of Spades',
    '6 of Spades',
    '7 of Spades',
  ];
  const majorSpades = [
    '9 of Spades',
    '10 of Spades',
    'Jack of Spades',
    'Queen of Spades',
    'King of Spades',
    'Ace of Spades',
  ];
  const minorClubs = [
    '2 of Clubs',
    '3 of Clubs',
    '4 of Clubs',
    '5 of Clubs',
    '6 of Clubs',
    '7 of Clubs',
  ];
  const majorClubs = [
    '9 of Clubs',
    '10 of Clubs',
    'Jack of Clubs',
    'Queen of Clubs',
    'King of Clubs',
    'Ace of Clubs',
  ];
  const minorDiamonds = [
    '2 of Diamonds',
    '3 of Diamonds',
    '4 of Diamonds',
    '5 of Diamonds',
    '6 of Diamonds',
    '7 of Diamonds',
  ];
  const majorDiamonds = [
    '9 of Diamonds',
    '10 of Diamonds',
    'Jack of Diamonds',
    'Queen of Diamonds',
    'King of Diamonds',
    'Ace of Diamonds',
  ];
  const minorHearts = [
    '2 of Hearts',
    '3 of Hearts',
    '4 of Hearts',
    '5 of Hearts',
    '6 of Hearts',
    '7 of Hearts',
  ];
  const majorHearts = [
    '9 of Hearts',
    '10 of Hearts',
    'Jack of Hearts',
    'Queen of Hearts',
    'King of Hearts',
    'Ace of Hearts',
  ];

  const spadesList = [
    '2 of Spades',
    '3 of Spades',
    '4 of Spades',
    '5 of Spades',
    '6 of Spades',
    '7 of Spades',
    '8 of Spades',
    '9 of Spades',
    '10 of Spades',
    'Jack of Spades',
    'Queen of Spades',
    'King of Spades',
    'Ace of Spades',
  ];
  const clubsList = [
    '2 of Clubs',
    '3 of Clubs',
    '4 of Clubs',
    '5 of Clubs',
    '6 of Clubs',
    '7 of Clubs',
    '8 of Clubs',
    '9 of Clubs',
    '10 of Clubs',
    'Jack of Clubs',
    'Queen of Clubs',
    'King of Clubs',
    'Ace of Clubs',
  ];
  const diamondsList = [
    '2 of Diamonds',
    '3 of Diamonds',
    '4 of Diamonds',
    '5 of Diamonds',
    '6 of Diamonds',
    '7 of Diamonds',
    '8 of Diamonds',
    '9 of Diamonds',
    '10 of Diamonds',
    'Jack of Diamonds',
    'Queen of Diamonds',
    'King of Diamonds',
    'Ace of Diamonds',
  ];
  const heartsList = [
    '2 of Hearts',
    '3 of Hearts',
    '4 of Hearts',
    '5 of Hearts',
    '6 of Hearts',
    '7 of Hearts',
    '8 of Hearts',
    '9 of Hearts',
    '10 of Hearts',
    'Jack of Hearts',
    'Queen of Hearts',
    'King of Hearts',
    'Ace of Hearts',
  ];

  const cardOrder = {
    Ace: 13,
    King: 12,
    Queen: 11,
    Jack: 10,
    10: 9,
    9: 8,
    8: 7,
    7: 6,
    6: 5,
    5: 4,
    4: 3,
    3: 2,
    2: 1,
  };

  const suitOrder = {
    Spades: 4,
    Clubs: 3,
    Diamonds: 2,
    Hearts: 1,
  };

  let globalSuit = ['Spade', 'Club', 'Diamond', 'Heart'];
  const [activeSuitTab, setActiveSuitTab] = useState(null);
  const handleSuitTabPress = item => {
    setActiveSuitTab(item);
  };

  let globalRank = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  let globalRankInMemoryGame = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  const [activeRankTab, setActiveRankTab] = useState(null);
  const handleRankTabPress = item => {
    setActiveRankTab(item);
  };

  const [activeMemberTab, setActiveMemberTab] = useState(null);
  const handleMemberTabPress = item => {
    setActiveMemberTab(item);
  };

  const GameSelectionTab = ({label, isActive, onPress, name}) => {
    const tabStyle = isActive ? styles.activeTab : styles.inactiveTab;
    const textStyles = isActive ? styles.activeText : styles.inactiveText;

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.tab, tabStyle]}>
          <Text style={textStyles}>{label}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  function truncateString(str, maxLength) {
    if (str.length > maxLength) {
      return str.slice(0, maxLength - 2) + '..';
    } else {
      return str;
    }
  }

  const Card = ({rank, suit, bigCard, person, cardWithPerson}) => {
    const trimmedSuit = suit.trim();
    const trimmedRank = rank.trim();
    return (
      <View style={bigCard ? styles.bigCard : styles.card}>
        <Text
          style={
            trimmedSuit === 'Hearts' || trimmedSuit === 'Diamonds'
              ? styles.cardTextRed
              : styles.cardTextBlack
          }>
          {trimmedRank === 'King'
            ? 'K'
            : trimmedRank === 'Queen'
            ? 'Q'
            : trimmedRank === 'Jack'
            ? 'J'
            : trimmedRank === 'Ace'
            ? 'A'
            : rank}
        </Text>
        <Text
          style={
            trimmedSuit === 'Hearts' || trimmedSuit === 'Diamonds'
              ? styles.cardTextRed
              : styles.cardTextBlack
          }>
          {suit}
        </Text>
        {trimmedSuit === 'Spades' ? (
          <ImageBackground
            source={spadeImage}
            style={{width: 20, height: 20}}></ImageBackground>
        ) : trimmedSuit === 'Clubs' ? (
          <ImageBackground
            source={clubImage}
            style={{width: 20, height: 20}}></ImageBackground>
        ) : trimmedSuit === 'Diamonds' ? (
          <ImageBackground
            source={diamondImage}
            style={{width: 20, height: 20}}></ImageBackground>
        ) : trimmedSuit === 'Hearts' ? (
          <ImageBackground
            source={heartImage}
            style={{width: 20, height: 20}}></ImageBackground>
        ) : null}
        <Text>{cardWithPerson ? `(${truncateString(person, 6)})` : null}</Text>
      </View>
    );
  };

  const CardAndMemberSelectionTab = ({label, isActive, onPress, name}) => {
    const tabStyle = isActive ? styles.activeTab : styles.inactiveTab;
    const textStyles = isActive ? styles.activeText : styles.inactiveText;

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.tab, tabStyle]}>
          <Text style={textStyles}>
            {name === true ? truncateString(label, 6) : label}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  function areAllElementsPresent(arr1, arr2) {
    for (let i = 0; i < arr2.length; i++) {
      if (!arr1.includes(arr2[i])) {
        return false;
      }
    }
    return true;
  }

  function removeElementsFromArray(arr1, arr2) {
    return arr1.filter(item => !arr2.includes(item));
  }

  function solobaseCaptureChecking() {
    if (areAllElementsPresent(cards, minorSpades)) {
      const resultArray = removeElementsFromArray(cards, minorSpades);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'minorSpades',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, majorSpades)) {
      const resultArray = removeElementsFromArray(cards, majorSpades);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'majorSpades',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, minorClubs)) {
      const resultArray = removeElementsFromArray(cards, minorClubs);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'minorClubs',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, majorClubs)) {
      const resultArray = removeElementsFromArray(cards, majorClubs);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'majorClubs',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, minorDiamonds)) {
      const resultArray = removeElementsFromArray(cards, minorDiamonds);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'minorDiamonds',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, majorDiamonds)) {
      const resultArray = removeElementsFromArray(cards, majorDiamonds);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'majorDiamonds',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, minorHearts)) {
      const resultArray = removeElementsFromArray(cards, minorHearts);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'minorHearts',
      };
      ws.send(JSON.stringify(message));
    }
    if (areAllElementsPresent(cards, majorHearts)) {
      const resultArray = removeElementsFromArray(cards, majorHearts);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Base Captured Message',
        fromPerson: name,
        baseCaptured: 'majorHearts',
      };
      ws.send(JSON.stringify(message));
    }
  }

  function duoBaseCaptureChecking() {
    let message = {
      roomId: roomId,
      type: 'Asking Partner Cards',
      fromPerson: name,
      toPerson: partner,
    };
    ws.send(JSON.stringify(message));
    let combainedCardsArray = [];
    cards.map(card => {
      combainedCardsArray.push(card);
    });
    partnerCards.map(card => {
      combainedCardsArray.push(card);
    });

    if (areAllElementsPresent(combainedCardsArray, minorSpades)) {
      const resultArray = removeElementsFromArray(cards, minorSpades);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'minorSpades',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorSpades',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorSpades',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'minorSpades',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, majorSpades)) {
      const resultArray = removeElementsFromArray(cards, majorSpades);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'majorSpades',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorSpades',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorSpades',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'majorSpades',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, minorClubs)) {
      const resultArray = removeElementsFromArray(cards, minorClubs);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'minorClubs',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorClubs',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorClubs',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'minorClubs',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, majorClubs)) {
      const resultArray = removeElementsFromArray(cards, majorClubs);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'majorClubs',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorClubs',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorClubs',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'majorClubs',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, minorDiamonds)) {
      const resultArray = removeElementsFromArray(cards, minorDiamonds);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'minorDiamonds',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorDiamonds',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorDiamonds',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'minorDiamonds',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, majorDiamonds)) {
      const resultArray = removeElementsFromArray(cards, majorDiamonds);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'majorDiamonds',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorDiamonds',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorDiamonds',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'majorDiamonds',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, minorHearts)) {
      const resultArray = removeElementsFromArray(cards, minorHearts);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'minorHearts',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorHearts',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'minorHearts',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'minorHearts',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
    if (areAllElementsPresent(combainedCardsArray, majorHearts)) {
      const resultArray = removeElementsFromArray(cards, majorHearts);
      cards = resultArray;
      setYourCards(resultArray);
      let message = {
        roomId: roomId,
        type: 'Removing Cards From Partner',
        fromPerson: name,
        toPerson: partner,
        baseCaptured: 'majorHearts',
      };
      ws.send(JSON.stringify(message));
      if (roomMembers.length === 6 || roomMembers.length === 8) {
        if (roomMembers.length === 6 && yourPosition > 2) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorHearts',
          };
          ws.send(JSON.stringify(secondmessage));
        } else if (roomMembers.length === 8 && yourPosition > 3) {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${partner} and ${name}`,
            baseCaptured: 'majorHearts',
          };
          ws.send(JSON.stringify(secondmessage));
        } else {
          let secondmessage = {
            roomId: roomId,
            type: 'Base Captured Message',
            fromPerson: `${name} and ${partner}`,
            baseCaptured: 'majorHearts',
          };
          ws.send(JSON.stringify(secondmessage));
        }
      }
    }
  }

  function findLargestCard(cardList) {
    let largestCard = cardList[0].split(' of ');
    largestCard = largestCard[0];
    for (let i = 1; i < cardList.length; i++) {
      let checkCard = cardList[i].split(' of ');
      if (cardOrder[checkCard[0]] > cardOrder[largestCard]) {
        largestCard = checkCard[0];
      }
    }
    return largestCard;
  }

  function JackAndFiveRoundWinningCardCheckFunction(cardList, suit) {
    let roundWinningCard = '';
    let cardsNotOfSameSuit = [];
    cardList.map(item => {
      let itemSuit = item.split(' of ');
      itemSuit = itemSuit[1];
      if (itemSuit !== suit) {
        cardsNotOfSameSuit.push(item);
      }
    });

    if (cardsNotOfSameSuit.length > 1) {
      let largestCard = cardsNotOfSameSuit[0].split(' of ');
      let largestCardRank = largestCard[0];
      let largestCardSuit = largestCard[1];
      for (let i = 1; i < cardsNotOfSameSuit.length; i++) {
        let checkCard = cardsNotOfSameSuit[i].split(' of ');
        if (cardOrder[checkCard[0]] > cardOrder[largestCardRank]) {
          largestCardRank = checkCard[0];
          largestCardSuit = checkCard[1];
        } else if (cardOrder[checkCard[0]] === cardOrder[largestCardRank]) {
          if (suitOrder[checkCard[1] > suitOrder[largestCardSuit]]) {
            largestCardRank = checkCard[0];
            largestCardSuit = checkCard[1];
          }
        }
      }
      roundWinningCard = `${largestCardRank} of ${largestCardSuit}`;
    } else if (cardsNotOfSameSuit.length === 1) {
      roundWinningCard = cardsNotOfSameSuit[0];
    } else {
      let largestCard = cardList[0].split(' of ');
      largestCard = largestCard[0];
      for (let i = 1; i < cardList.length; i++) {
        let checkCard = cardList[i].split(' of ');
        if (cardOrder[checkCard[0]] > cardOrder[largestCard]) {
          largestCard = checkCard[0];
        }
      }
      roundWinningCard = `${largestCard} of ${suit}`;
    }
    return roundWinningCard;
  }

  function createKeyValuePairs(arr) {
    const playerPoints = {};

    for (const item of arr) {
      if (playerPoints[item]) {
        playerPoints[item] += 1;
      } else {
        playerPoints[item] = 1;
      }
    }

    const playerPointsArray = [];
    for (const player in playerPoints) {
      playerPointsArray.push({player, points: playerPoints[player]});
    }

    playerPointsArray.sort((a, b) => b.points - a.points);

    return playerPointsArray;
  }

  useEffect(() => {
    // ws.onopen = event => {
    //   console.log('WebSocket connection opened:', event);
    // };

    // ws.onclose = event => {
    //   console.log('WebSocket closed:', event);
    // };

    // ws.onerror = event => {
    //   console.log('WebSocket error:', event);
    // };

    ws.onmessage = event => {
      const resp = JSON.parse(event.data);
      if (resp.roomId === roomId) {
        if (resp.type === 'delete') {
          console.log(resp);
          setParticipants([]);
          roomMembers = [];
          setCreateRoom(false);
          setJoinedRoom(false);
          setJoinRoom(false);
          roomId = '';
          name = '';
          setMessage('');
          setEnteredRoomId('');
          setEnteredName('');
          Snackbar.show({
            text: `${resp.notifyMessage}`,
            duration: Snackbar.LENGTH_LONG,
          });
        }

        if (resp.type === 'kicked' && resp.sender === name) {
          setParticipants([]);
          roomMembers = [];
          setJoinedRoom(false);
          setJoinRoom(false);
          roomId = '';
          setMessage('');
          setEnteredRoomId('');
          setEnteredName('');
          name = '';
          setActiveGameTab(null);
          gameSelected = '';
          Snackbar.show({
            text: `${resp.notifyMessage}`,
            duration: Snackbar.LENGTH_LONG,
          });
        }

        if (resp.type === 'Fetching GameName' && resp.toPerson === name) {
          let message = {
            roomId: roomId,
            type: 'Fetching GameName Response',
            gameName: gameSelected,
            fromPerson: 'host',
          };
          ws.send(JSON.stringify(message));
        }

        if (
          resp.type === 'Fetching GameName Response' &&
          resp.fromPerson !== name
        ) {
          setActiveGameTab(resp.gameName);
          gameSelected = resp.gameName;
        }

        if (resp.type === 'Game Started' && resp.cardsOf === name) {
          if (roomMembers.length === 4 && gameSelected === 'Memory') {
            Snackbar.show({
              text: 'Game Started\nOnly 4 participants are there so no teaming . All are individual Players',
              duration: Snackbar.LENGTH_LONG,
              numberOfLines: 2,
            });
          } else if (roomMembers.length === 6 && gameSelected === 'Memory') {
            roomMembers.map((item, index) => {
              if (item === name) {
                if (index < 3) {
                  partner = roomMembers[index + 3];
                } else {
                  partner = roomMembers[index - 3];
                }
              }
            });
            Snackbar.show({
              text: `Game Started\n${roomMembers[0]} and ${roomMembers[3]} are team\n${roomMembers[1]} and ${roomMembers[4]} are team\n${roomMembers[2]} and ${roomMembers[5]} are team`,
              duration: Snackbar.LENGTH_LONG,
              numberOfLines: 4,
            });
          } else if (roomMembers.length === 8 && gameSelected === 'Memory') {
            roomMembers.map((item, index) => {
              if (item === name) {
                if (index < 4) {
                  partner = roomMembers[index + 4];
                } else {
                  partner = roomMembers[index - 4];
                }
              }
            });
            Snackbar.show({
              text: `Game Started\n${roomMembers[0]} and ${roomMembers[4]} are team\n${roomMembers[1]} and ${roomMembers[5]} are team\n${roomMembers[2]} and ${roomMembers[6]} are team\n${roomMembers[3]} and ${roomMembers[7]} are team`,
              duration: Snackbar.LENGTH_LONG,
              numberOfLines: 5,
            });
          } else if (gameSelected === 'Ace') {
            Snackbar.show({
              text: `Game Started`,
              duration: Snackbar.LENGTH_LONG,
              numberOfLines: 1,
            });
          } else if (gameSelected === 'JackAndFive') {
            roomMembers.map((item, index) => {
              if (item === name) {
                if (index < 2) {
                  partner = roomMembers[index + 2];
                } else {
                  partner = roomMembers[index - 2];
                }
              }
            });
            Snackbar.show({
              text: `Game Started\n${roomMembers[0]} and ${roomMembers[2]} are team\n${roomMembers[1]} and ${roomMembers[3]} are team`,
              duration: Snackbar.LENGTH_LONG,
              numberOfLines: 3,
            });
          }
          console.log(resp);
          const cardString = resp.cards;
          const cardArray = cardString.split(', ');
          setYourCards(cardArray);
          cards = cardArray;
          roomMembers.map((item, index) => {
            if (item === name) {
              yourPosition = index;
            }
          });
          setTurnMessage(resp.turnMessage);
          if (gameSelected === 'Memory') {
            roomMembers.map(item => {
              if (roomMembers.length === 4) {
                if (item !== name) {
                  membersYouCanAsk.push(item);
                }
              } else {
                if (item !== name && item !== partner) {
                  membersYouCanAsk.push(item);
                }
                let message = {
                  roomId: roomId,
                  type: 'Asking Partner Cards',
                  fromPerson: name,
                  toPerson: partner,
                };
                ws.send(JSON.stringify(message));
              }
            });
          }
          if (resp.turnMessage === `${name} is playing...`) {
            setYourTurn(true);
          }
          setGameScreen(true);
        }

        if (resp.type === 'Asking Card' && resp.toPerson === name) {
          console.log(resp);
          if (cards.includes(resp.card)) {
            const newArray = cards.filter(item => item !== resp.card);
            setYourCards(newArray);
            cards = newArray;
            let message = {
              roomId: roomId,
              type: 'Asked Card Response',
              fromPerson: name,
              toPerson: resp.fromPerson,
              response: 'Yes',
              card: resp.card,
            };
            ws.send(JSON.stringify(message));
          } else {
            let message = {
              roomId: roomId,
              type: 'Asked Card Response',
              fromPerson: name,
              toPerson: resp.fromPerson,
              response: 'No',
            };
            ws.send(JSON.stringify(message));
          }
        }

        if (resp.type === 'Asking Card') {
          setFromPerson(resp.fromPerson);
          setToPerson(resp.toPerson);
          let spliting = resp.card.split('of');
          setAskedCardRank(spliting[0]);
          setAskedCardSuit(spliting[1]);
        }

        if (resp.type === 'Asked Card Response' && resp.toPerson === name) {
          console.log(resp);

          if (resp.response === 'Yes') {
            yourCards.push(resp.card);
            cards.push(resp.card);
            setActiveMemberTab(null);
            setActiveSuitTab(null);
            setActiveRankTab(null);
            Snackbar.show({
              text: 'your guess is correct and card is added in your cards list, continue your guess',
              duration: Snackbar.LENGTH_LONG,
            });

            if (roomMembers.length === 4) {
              solobaseCaptureChecking();
            }

            if (roomMembers.length === 6 || roomMembers.length === 8) {
              duoBaseCaptureChecking();
            }
          }
          if (resp.response === 'No') {
            setActiveMemberTab(null);
            setActiveSuitTab(null);
            setActiveRankTab(null);
            if (roomMembers.length === 4) {
              if (name === roomMembers[3]) {
                let message = {
                  roomId: roomId,
                  type: 'Next Turn',
                  nextPerson: roomMembers[0],
                  turnMessage: `${roomMembers[0]} is playing...`,
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Next Turn',
                  nextPerson: roomMembers[yourPosition + 1],
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                };
                ws.send(JSON.stringify(message));
              }
            }
            if (roomMembers.length === 6) {
              if (name === roomMembers[5]) {
                let message = {
                  roomId: roomId,
                  type: 'Next Turn',
                  nextPerson: roomMembers[0],
                  turnMessage: `${roomMembers[0]} is playing...`,
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Next Turn',
                  nextPerson: roomMembers[yourPosition + 1],
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                };
                ws.send(JSON.stringify(message));
              }
            }
            if (roomMembers.length === 8) {
              if (name === roomMembers[7]) {
                let message = {
                  roomId: roomId,
                  type: 'Next Turn',
                  nextPerson: roomMembers[0],
                  turnMessage: `${roomMembers[0]} is playing...`,
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Next Turn',
                  nextPerson: roomMembers[yourPosition + 1],
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                };
                ws.send(JSON.stringify(message));
              }
            }
            setYourTurn(false);
          }
        }

        if (resp.type === 'Asked Card Response') {
          if (resp.response === 'Yes') {
            setResponseForTheCard('correct');
          }
          if (resp.response === 'No') {
            setResponseForTheCard('wrong');
          }
        }

        if (resp.type === 'Next Turn') {
          console.log(resp);
          if (resp.nextPerson === name) {
            if (cards.length > 0) {
              setYourTurn(true);
            } else {
              if (gameCompletedOrderList.includes(name)) {
                null;
              } else {
                let message = {
                  roomId: roomId,
                  type: 'completionMessage',
                  message: `${name} finished the game`,
                };
                ws.send(JSON.stringify(message));
                gameCompletedOrderList.push(name);
              }

              if (roomMembers.length === 4) {
                if (roomMembers[3] !== name) {
                  let message = {
                    roomId: roomId,
                    type: 'Next Turn',
                    nextPerson: roomMembers[yourPosition + 1],
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Next Turn',
                    nextPerson: roomMembers[0],
                    turnMessage: `${roomMembers[0]} is playing...`,
                  };
                  ws.send(JSON.stringify(message));
                }
              }
              if (roomMembers.length === 6) {
                if (roomMembers[5] !== name) {
                  let message = {
                    roomId: roomId,
                    type: 'Next Turn',
                    nextPerson: roomMembers[yourPosition + 1],
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Next Turn',
                    nextPerson: roomMembers[0],
                    turnMessage: `${roomMembers[0]} is playing...`,
                  };
                  ws.send(JSON.stringify(message));
                }
              }
              if (roomMembers.length === 8) {
                if (roomMembers[7] !== name) {
                  let message = {
                    roomId: roomId,
                    type: 'Next Turn',
                    nextPerson: roomMembers[yourPosition + 1],
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Next Turn',
                    nextPerson: roomMembers[0],
                    turnMessage: `${roomMembers[0]} is playing...`,
                  };
                  ws.send(JSON.stringify(message));
                }
              }
            }
          }
          setTurnMessage(resp.turnMessage);
          setResponseForTheCard('');
          setFromPerson('');
          setToPerson('');
        }

        if (
          resp.type === 'Asking Partner Cards' &&
          resp.fromPerson === partner &&
          resp.toPerson === name
        ) {
          let message = {
            roomId: roomId,
            type: 'Asking Partner Cards Response',
            fromPerson: name,
            toPerson: partner,
            cards: cards,
          };
          ws.send(JSON.stringify(message));
        }

        if (
          resp.type === 'Asking Partner Cards Response' &&
          resp.fromPerson === partner &&
          resp.toPerson === name
        ) {
          partnerCards = resp.cards;
        }

        if (
          resp.type === 'Removing Cards From Partner' &&
          resp.fromPerson === partner &&
          resp.toPerson === name
        ) {
          if (resp.baseCaptured === 'minorSpades') {
            const resultArray = removeElementsFromArray(cards, minorSpades);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'majorSpades') {
            const resultArray = removeElementsFromArray(cards, majorSpades);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'minorClubs') {
            const resultArray = removeElementsFromArray(cards, minorClubs);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'majorClubs') {
            const resultArray = removeElementsFromArray(cards, majorClubs);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'minorDiamonds') {
            const resultArray = removeElementsFromArray(cards, minorDiamonds);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'majorDiamonds') {
            const resultArray = removeElementsFromArray(cards, majorDiamonds);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'minorHearts') {
            const resultArray = removeElementsFromArray(cards, minorHearts);
            cards = resultArray;
            setYourCards(resultArray);
          }
          if (resp.baseCaptured === 'majorHearts') {
            const resultArray = removeElementsFromArray(cards, majorHearts);
            cards = resultArray;
            setYourCards(resultArray);
          }
        }

        if (resp.type === 'Base Captured Message') {
          let messageString = `${resp.fromPerson} captured ${resp.baseCaptured}`;
          pointsMessage.push(messageString);
          Snackbar.show({
            text: messageString,
            duration: Snackbar.LENGTH_LONG,
          });
          totalPoints = totalPoints + 1;

          if (totalPoints === 8) {
            let checkArray = [];
            pointsMessage.map(item => {
              let splited = item.split(' captured');
              checkArray.push(splited[0]);
            });
            const playerPoints = createKeyValuePairs(checkArray);
            let message = {
              roomId: roomId,
              type: 'Game Over',
              result: playerPoints,
            };
            ws.send(JSON.stringify(message));
          }
        }

        if (resp.type === 'Card Added To The Round') {
          console.log(resp);
          onGoingSuitOfTheRound = resp.suit;
          roundOrder.push(resp.fromPerson);
          cardDeliveredInOrder.push(resp.card);
          if (roundOrder.includes(resp.nextPerson)) {
            if (gameSelected === 'Ace') {
              let largestCard = findLargestCard(cardDeliveredInOrder);
              largestCard = `${largestCard} of ${onGoingSuitOfTheRound}`;
              let index = cardDeliveredInOrder.indexOf(largestCard);
              let personToStartNextRound = roundOrder[index];
              setTurnMessage('');
              setTimeout(() => {
                onGoingSuitOfTheRound = '';
                roundOrder = [];
                cardDeliveredInOrder = [];
              }, 3000);
              setTimeout(() => {
                Snackbar.show({
                  text: 'Round Completed',
                  duration: Snackbar.LENGTH_LONG,
                });
                if (personToStartNextRound === name) {
                  let message = {
                    roomId: roomId,
                    type: 'NextRound',
                    turnMessage: `${personToStartNextRound} is playing...`,
                    startPerson: personToStartNextRound,
                  };
                  ws.send(JSON.stringify(message));
                }
              }, 4000);
            }
            if (gameSelected === 'JackAndFive') {
              let roundWinningCard = JackAndFiveRoundWinningCardCheckFunction(
                cardDeliveredInOrder,
                onGoingSuitOfTheRound,
              );
              let index = cardDeliveredInOrder.indexOf(roundWinningCard);
              let personToStartNextRound = roundOrder[index];
              if (yourPosition > 1) {
                let messageString = `${name} and ${partner}`;
                pointsMessage.push(messageString);
                cardDeliveredInOrder.map(item => {
                  let checkString = item.split(' of ');
                  checkString = checkString[0];
                  if (checkString[0] === 'Jack') {
                    jackandfiveCaptureList.push(
                      `jack captured by ${messageString}`,
                    );
                  }
                  if (checkString[0] === '5') {
                    jackandfiveCaptureList.push(
                      `five captured by ${messageString}`,
                    );
                  }
                });
              } else {
                let messageString = `${partner} and ${name}`;
                pointsMessage.push(messageString);
                cardDeliveredInOrder.map(item => {
                  let checkString = item.split(' of ');
                  checkString = checkString[0];
                  if (checkString[0] === 'Jack') {
                    jackandfiveCaptureList.push(
                      `jack captured by ${messageString}`,
                    );
                  }
                  if (checkString[0] === '5') {
                    jackandfiveCaptureList.push(
                      `five captured by ${messageString}`,
                    );
                  }
                });
              }
              setTurnMessage('');
              setTimeout(() => {
                onGoingSuitOfTheRound = '';
                roundOrder = [];
                cardDeliveredInOrder = [];
              }, 3000);
              setTimeout(() => {
                Snackbar.show({
                  text: 'Round Completed',
                  duration: Snackbar.LENGTH_LONG,
                });
                if (personToStartNextRound === name) {
                  let message = {
                    roomId: roomId,
                    type: 'NextRound',
                    turnMessage: `${personToStartNextRound} is playing...`,
                    startPerson: personToStartNextRound,
                  };
                  ws.send(JSON.stringify(message));
                }
              }, 4000);
            }
          } else {
            if (resp.nextPerson === name) {
              if (cards.length > 0) {
                setYourTurn(true);
              } else {
                if (gameCompletedOrderList.includes(name)) {
                  null;
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'completionMessage',
                    message: `${name} finished the game`,
                  };
                  ws.send(JSON.stringify(message));
                  gameCompletedOrderList.push(name);
                  if (gameSelected === 'Ace') {
                    if (
                      roomMembers.length - gameCompletedOrderList.length ===
                      1
                    ) {
                      let message = {
                        roomId: roomId,
                        type: 'Game Over',
                        result: gameCompletedOrderList,
                      };
                      ws.send(JSON.stringify(message));
                    }
                  }
                  if (gameSelected === 'JackAndFive') {
                    if (
                      roomMembers.length - gameCompletedOrderList.length ===
                      0
                    ) {
                      const playerPoints = createKeyValuePairs(pointsMessage);
                      let message = {
                        roomId: roomId,
                        type: 'Game Over',
                        result: playerPoints,
                      };
                      ws.send(JSON.stringify(message));
                    }
                  }
                }
                let lastIndex = roomMembers.length - 1;
                if (name === roomMembers[lastIndex]) {
                  let message = {
                    roomId: roomId,
                    type: 'NoTurnDueToNoCards',
                    turnMessage: `${roomMembers[0]} is playing...`,
                    nextPerson: roomMembers[0],
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'NoTurnDueToNoCards',
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                    nextPerson: roomMembers[yourPosition + 1],
                  };
                  ws.send(JSON.stringify(message));
                }
              }
            }
            setTurnMessage(resp.turnMessage);
          }
        }

        if (resp.type === 'Round Cutted') {
          console.log(resp);
          if (gameSelected === 'Ace') {
            Snackbar.show({
              text: `Round Cutted by ${resp.fromPerson} with ${resp.card}`,
              duration: Snackbar.LENGTH_LONG,
            });
            let largestCard = findLargestCard(cardDeliveredInOrder);
            largestCard = `${largestCard} of ${onGoingSuitOfTheRound}`;
            let index = cardDeliveredInOrder.indexOf(largestCard);
            let personToStartNextRound = roundOrder[index];
            cardDeliveredInOrder.push(resp.card);
            if (personToStartNextRound === name) {
              let message = {
                roomId: roomId,
                type: 'NextRoundDueToCutting',
                turnMessage: `${personToStartNextRound} is playing...`,
                startPerson: personToStartNextRound,
                cardsToBeAddedInHisList: cardDeliveredInOrder,
              };
              ws.send(JSON.stringify(message));
            }
            onGoingSuitOfTheRound = '';
            roundOrder = [];
            cardDeliveredInOrder = [];
          }
          if (gameSelected === 'JackAndFive') {
            roundOrder.push(resp.fromPerson);
            cardDeliveredInOrder.push(resp.card);
            if (roundOrder.includes(resp.nextPerson)) {
              let roundWinningCard = JackAndFiveRoundWinningCardCheckFunction(
                cardDeliveredInOrder,
                onGoingSuitOfTheRound,
              );
              let index = cardDeliveredInOrder.indexOf(roundWinningCard);
              let personToStartNextRound = roundOrder[index];
              if (yourPosition > 1) {
                let messageString = `${name} and ${partner}`;
                pointsMessage.push(messageString);
                cardDeliveredInOrder.map(item => {
                  let checkString = item.split(' of ');
                  checkString = checkString[0];
                  if (checkString[0] === 'Jack') {
                    jackandfiveCaptureList.push(
                      `jack captured by ${messageString}`,
                    );
                  }
                  if (checkString[0] === '5') {
                    jackandfiveCaptureList.push(
                      `five captured by ${messageString}`,
                    );
                  }
                });
              } else {
                let messageString = `${partner} and ${name}`;
                pointsMessage.push(messageString);
                cardDeliveredInOrder.map(item => {
                  let checkString = item.split(' of ');
                  checkString = checkString[0];
                  if (checkString[0] === 'Jack') {
                  }
                  if (checkString[0] === '5') {
                  }
                });
              }
              setTurnMessage('');
              setTimeout(() => {
                onGoingSuitOfTheRound = '';
                roundOrder = [];
                cardDeliveredInOrder = [];
              }, 3000);
              setTimeout(() => {
                Snackbar.show({
                  text: 'Round Completed',
                  duration: Snackbar.LENGTH_LONG,
                });
                if (personToStartNextRound === name) {
                  let message = {
                    roomId: roomId,
                    type: 'NextRound',
                    turnMessage: `${personToStartNextRound} is playing...`,
                    startPerson: personToStartNextRound,
                  };
                  ws.send(JSON.stringify(message));
                }
              }, 4000);
            } else {
              if (resp.nextPerson === name) {
                if (cards.length > 0) {
                  setYourTurn(true);
                } else {
                  if (gameCompletedOrderList.includes(name)) {
                    null;
                  } else {
                    let message = {
                      roomId: roomId,
                      type: 'completionMessage',
                      message: `${name} finished the game`,
                    };
                    ws.send(JSON.stringify(message));
                    gameCompletedOrderList.push(name);
                    if (
                      roomMembers.length - gameCompletedOrderList.length ===
                      0
                    ) {
                      const playerPoints = createKeyValuePairs(pointsMessage);
                      let message = {
                        roomId: roomId,
                        type: 'Game Over',
                        result: playerPoints,
                      };
                      ws.send(JSON.stringify(message));
                    }
                  }
                  let lastIndex = roomMembers.length - 1;
                  if (name === roomMembers[lastIndex]) {
                    let message = {
                      roomId: roomId,
                      type: 'NoTurnDueToNoCards',
                      turnMessage: `${roomMembers[0]} is playing...`,
                      nextPerson: roomMembers[0],
                    };
                    ws.send(JSON.stringify(message));
                  } else {
                    let message = {
                      roomId: roomId,
                      type: 'NoTurnDueToNoCards',
                      turnMessage: `${
                        roomMembers[yourPosition + 1]
                      } is playing...`,
                      nextPerson: roomMembers[yourPosition + 1],
                    };
                    ws.send(JSON.stringify(message));
                  }
                }
              }
              setTurnMessage(resp.turnMessage);
            }
          }
        }

        if (
          resp.type === 'NextRound' ||
          resp.type === 'NextRoundDueToCutting'
        ) {
          console.log(resp);
          if (
            resp.type === 'NextRoundDueToCutting' &&
            resp.startPerson === name
          ) {
            let newArray = cards.concat(resp.cardsToBeAddedInHisList);
            setYourCards(newArray);
            cards = newArray;
          }
          if (resp.startPerson === name) {
            if (cards.length > 0) {
              setYourTurn(true);
            } else {
              if (gameCompletedOrderList.includes(name)) {
                null;
              } else {
                let message = {
                  roomId: roomId,
                  type: 'completionMessage',
                  message: `${name} finished the game`,
                };
                ws.send(JSON.stringify(message));
                gameCompletedOrderList.push(name);
                if (gameSelected === 'Ace') {
                  if (
                    roomMembers.length - gameCompletedOrderList.length ===
                    1
                  ) {
                    let message = {
                      roomId: roomId,
                      type: 'Game Over',
                      result: gameCompletedOrderList,
                    };
                    ws.send(JSON.stringify(message));
                  }
                }
                if (gameSelected === 'JackAndFive') {
                  if (
                    roomMembers.length - gameCompletedOrderList.length ===
                    0
                  ) {
                    const playerPoints = createKeyValuePairs(pointsMessage);
                    let message = {
                      roomId: roomId,
                      type: 'Game Over',
                      result: playerPoints,
                    };
                    ws.send(JSON.stringify(message));
                  }
                }
              }
              let lastIndex = roomMembers.length - 1;
              if (name === roomMembers[lastIndex]) {
                let message = {
                  roomId: roomId,
                  type: 'NoTurnDueToNoCards',
                  turnMessage: `${roomMembers[0]} is playing...`,
                  nextPerson: roomMembers[0],
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'NoTurnDueToNoCards',
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                  nextPerson: roomMembers[yourPosition + 1],
                };
                ws.send(JSON.stringify(message));
              }
            }
          }
          setTurnMessage(resp.turnMessage);
        }

        if (resp.type === 'NoTurnDueToNoCards') {
          console.log(resp);
          if (resp.nextPerson === name) {
            if (cards.length > 0) {
              setYourTurn(true);
            } else {
              if (gameCompletedOrderList.includes(name)) {
                null;
              } else {
                let message = {
                  roomId: roomId,
                  type: 'completionMessage',
                  message: `${name} finished the game`,
                };
                ws.send(JSON.stringify(message));
                gameCompletedOrderList.push(name);
                if (gameSelected === 'Ace') {
                  if (
                    roomMembers.length - gameCompletedOrderList.length ===
                    1
                  ) {
                    let message = {
                      roomId: roomId,
                      type: 'Game Over',
                      result: gameCompletedOrderList,
                    };
                    ws.send(JSON.stringify(message));
                  }
                }
                if (gameSelected === 'JackAndFive') {
                  if (
                    roomMembers.length - gameCompletedOrderList.length ===
                    0
                  ) {
                    const playerPoints = createKeyValuePairs(pointsMessage);
                    let message = {
                      roomId: roomId,
                      type: 'Game Over',
                      result: playerPoints,
                    };
                    ws.send(JSON.stringify(message));
                  }
                }
              }
              let lastIndex = roomMembers.length - 1;
              if (name === roomMembers[lastIndex]) {
                let message = {
                  roomId: roomId,
                  type: 'NoTurnDueToNoCards',
                  turnMessage: `${roomMembers[0]} is playing...`,
                  nextPerson: roomMembers[0],
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'NoTurnDueToNoCards',
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                  nextPerson: roomMembers[yourPosition + 1],
                };
                ws.send(JSON.stringify(message));
              }
            }
          }
          setTurnMessage(resp.turnMessage);
        }

        if (resp.type === 'completionMessage') {
          Snackbar.show({
            text: resp.message,
            duration: Snackbar.LENGTH_LONG,
          });
        }

        if (resp.type === 'Game Over') {
          if (yourTurn) {
            setYourTurn(false);
          }
          if (viewCardsScreen) {
            setViewCardsScreen(false);
          }
          if (roundInfoScreen) {
            setRoundInfoScreen(false);
          }
          let endResultOfJackAndFive = [];
          if (gameSelected === 'JackAndFive') {
            jackCapturedByTeam1 = 0;
            fiveCapturedByTeam1 = 0;
            jackCapturedByTeam2 = 0;
            fiveCapturedByTeam2 = 0;
            jackandfiveCaptureList.map(item => {
              let splitted = item.split(' captured by ');
              if (
                splitted[0] === 'jack' &&
                splitted[1] === `${roomMembers[0]} and ${roomMembers[2]}`
              ) {
                jackCapturedByTeam1 = jackCapturedByTeam1 + 10;
              }
              if (
                splitted[0] === 'five' &&
                splitted[1] === `${roomMembers[0]} and ${roomMembers[2]}`
              ) {
                fiveCapturedByTeam1 = fiveCapturedByTeam1 + 5;
              }
              if (
                splitted[0] === 'jack' &&
                splitted[1] === `${roomMembers[1]} and ${roomMembers[3]}`
              ) {
                jackCapturedByTeam2 = jackCapturedByTeam2 + 10;
              }
              if (
                splitted[0] === 'five' &&
                splitted[1] === `${roomMembers[1]} and ${roomMembers[3]}`
              ) {
                fiveCapturedByTeam2 = fiveCapturedByTeam2 + 5;
              }
            });
            resp.result.map(item => {
              if (item.player === `${roomMembers[0]} and ${roomMembers[2]}`) {
                let player = item.player;
                let points =
                  item.points + jackCapturedByTeam1 - fiveCapturedByTeam1;
                endResultOfJackAndFive.push({player: player, points: points});
              }
              if (item.player === `${roomMembers[1]} and ${roomMembers[3]}`) {
                let player = item.player;
                let points =
                  item.points + jackCapturedByTeam2 - fiveCapturedByTeam2;
                endResultOfJackAndFive.push({player: player, points: points});
              }
            });
          }
          setAskedCardSuit('');
          setAskedCardRank('');
          setResponseForTheCard('');
          setToPerson('');
          setFromPerson('');
          setTurnMessage('');
          setGameScreen(false);
          membersYouCanAsk = [];
          cards = [];
          yourPosition = null;
          partnerCards = [];
          cardDeliveredInOrder = [];
          roundOrder = [];
          onGoingSuitOfTheRound = '';
          endResult =
            gameSelected === 'JackAndFive'
              ? endResultOfJackAndFive
              : resp.result;
          setEndGameScreen(true);
        }

        if (
          resp.type === 'delete' ||
          resp.type === 'Game Started' ||
          resp.type === 'Asking Card' ||
          resp.type === 'Asked Card Response' ||
          resp.type === 'Next Turn' ||
          resp.type === 'Base Captured Message' ||
          resp.type === 'Game Over' ||
          resp.type === 'Asking Partner Cards Response' ||
          resp.type === 'Asking Partner Cards' ||
          resp.type === 'Removing Cards From Partner' ||
          resp.type === 'Fetching GameName Response' ||
          resp.type === 'Fetching GameName' ||
          resp.type === 'completionMessage' ||
          resp.type === 'NoTurnDueToNoCards' ||
          resp.type === 'NextRound' ||
          resp.type === 'NextRoundDueToCutting' ||
          resp.type === 'Round Cutted' ||
          resp.type === 'Card Added To The Round'
        ) {
          null;
        } else {
          console.log(resp);
          fetchParticipants(resp.roomId);
          if (resp.type === 'leave' && resp.sender === name) {
            null;
          } else {
            Snackbar.show({
              text: `${resp.notifyMessage}`,
              duration: Snackbar.LENGTH_LONG,
            });
          }
        }
      }
    };
  }, []);

  const handleLogout = () => {
    BackHandler.exitApp();
  };

  const handleExit = () => {
    if (createRoom) {
      setCreateRoom(false);
    }
    if (joinRoom) {
      setJoinRoom(false);
    }
    if (joinedRoom) {
      setJoinedRoom(false);
    }
    setEnteredRoomId('');
    setEnteredName('');
    setParticipants([]);
    setMessage('');
    setActiveGameTab(null);
    setEndGameScreen(false);
    pointsMessage = [];
    totalPoints = null;
    endResult = [];
    roomMembers = [];
    partner = '';
    gameCompletedOrderList = [];
    name = '';
    roomId = '';
    gameSelected = '';
  };

  const fetchParticipants = async id => {
    await axios
      .get(
        `https://game-server-production-dfa9.up.railway.app/get-participants/${id}`,
      )
      .then(response => {
        const participants = response.data;
        setParticipants(participants);
        roomMembers = participants;
      })
      .catch(error => {
        console.log('Error fetching participants:', error);
      });
  };

  const createRoomServer = async () => {
    try {
      const response = await axios.post(
        'https://game-server-production-dfa9.up.railway.app/create-room',
      );
      if (response.data.roomId) {
        roomId = response.data.roomId;
        setMessage(`RoomId : ${response.data.roomId}`);
        try {
          name = 'host';
          if (roomId !== '') {
            const resp = await axios.post(
              'https://game-server-production-dfa9.up.railway.app/join-room',
              {
                roomId,
                name,
              },
            );
            if (resp.status === 200) {
              setCreateRoom(true);
            }
          }
        } catch (error) {
          Snackbar.show({
            text: `Error in joining the room for creater : ${error}`,
            duration: Snackbar.LENGTH_LONG,
          });
        }
      }
    } catch (error) {
      Snackbar.show({
        text: 'Room Creation not successful',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const joinRoomServer = async () => {
    const namepattern = /^[A-Za-z0-9_]{3,12}$/;

    if (roomId === '') {
      Snackbar.show({
        text: 'You cannot join without roomId',
        duration: Snackbar.LENGTH_LONG,
      });
    } else if (roomId !== '') {
      const response = await axios.get(
        `https://game-server-production-dfa9.up.railway.app/get-participants/${roomId}`,
      );
      if (response.data) {
        let members = response.data;
        if (name === '') {
          Snackbar.show({
            text: 'You cannot join with empty name',
            duration: Snackbar.LENGTH_LONG,
          });
        } else if (name === 'host') {
          Snackbar.show({
            text: 'Dont use host as your name',
            duration: Snackbar.LENGTH_LONG,
          });
          name = '';
        } else if (members.includes(name)) {
          Snackbar.show({
            text: 'Name Already Taken',
            duration: Snackbar.LENGTH_LONG,
          });
          name = '';
        } else if (!namepattern.test(name)) {
          Snackbar.show({
            text: 'Name can be between 3 to 12 characters without any special symbols and emojis and can accept _',
            duration: Snackbar.LENGTH_LONG,
          });
          name = '';
        } else if (members.length >= 7) {
          Snackbar.show({
            text: 'This room is full. Maximum of 8 players only can play this game.',
            duration: Snackbar.LENGTH_LONG,
          });
          roomId = '';
          name = '';
        } else {
          try {
            const response = await axios.post(
              'https://game-server-production-dfa9.up.railway.app/join-room',
              {roomId, name},
            );
            if (response.status === 200) {
              setJoinedRoom(true);
              setMessage('Joined room successfully');
              let message = {
                roomId: roomId,
                type: 'Fetching GameName',
                toPerson: 'host',
              };
              ws.send(JSON.stringify(message));
            }
          } catch (error) {
            roomId = '';
            Snackbar.show({
              text: `Error in joining the room : ${error}`,
              duration: Snackbar.LENGTH_LONG,
            });
          }
        }
      }
    }
  };

  const leaveRoomServer = async () => {
    try {
      type = 'leave';
      const response = await axios.post(
        'https://game-server-production-dfa9.up.railway.app/leave-room',
        {
          roomId,
          name,
          type,
        },
      );
      if (response.status === 200) {
        setJoinRoom(false);
        setJoinedRoom(false);
        roomId = '';
        setEnteredRoomId('');
        setEnteredName('');
        name = '';
        setMessage('');
        setActiveGameTab(null);
        gameSelected = '';
      }
    } catch (error) {
      Snackbar.show({
        text: `Error leaving the room: ${error}`,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const kickPlayer = async () => {
    if (playerToBeKicked === '') {
      Snackbar.show({
        text: 'Please enter the player name you want to kick',
        duration: Snackbar.LENGTH_LONG,
      });
    } else if (playerToBeKicked === 'host') {
      Snackbar.show({
        text: 'You are the host! you cannot kick yourself. If you want to delete this room choose delete room option',
        duration: Snackbar.LENGTH_LONG,
      });
      setPlayerToBeKicked('');
    } else if (participants.includes(playerToBeKicked)) {
      try {
        let name = playerToBeKicked;
        type = 'kick';
        const response = await axios.post(
          'https://game-server-production-dfa9.up.railway.app/leave-room',
          {
            roomId,
            name,
            type,
          },
        );
        if (response.status === 200) {
          setPlayerToBeKicked('');
          setModalVisible(!isModalVisible);
        }
      } catch (error) {
        setPlayerToBeKicked('');
        name = '';
        Snackbar.show({
          text: `Error in kicking the player: ${error}`,
          duration: Snackbar.LENGTH_LONG,
        });
      }
    } else {
      Snackbar.show({
        text: 'The player you have mentioned is not there in the room',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const deleteRoom = async () => {
    try {
      const response = await axios.delete(
        `https://game-server-production-dfa9.up.railway.app/delete-room/${roomId}`,
      );
      setActiveGameTab(null);
      gameSelected = '';
    } catch (error) {
      Snackbar.show({
        text: `Error in deleting the room: ${error}`,
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  const playGame = async () => {
    if (gameSelected === 'Memory' && roomMembers.length < 4) {
      Snackbar.show({
        text: 'Need atleast 4 players to play the game',
        duration: Snackbar.LENGTH_LONG,
      });
    } else if (
      gameSelected === 'Memory' &&
      (roomMembers.length === 5 || roomMembers.length === 7)
    ) {
      Snackbar.show({
        text: 'Need even number of players to play the game',
        duration: Snackbar.LENGTH_LONG,
      });
    } else if (gameSelected === 'Ace' && roomMembers.length < 2) {
      Snackbar.show({
        text: 'Need atleast 2 players to play the game',
        duration: Snackbar.LENGTH_LONG,
      });
    } else if (gameSelected === 'JackAndFive' && roomMembers.length !== 4) {
      Snackbar.show({
        text: 'Need exactly 4 players to play the game',
        duration: Snackbar.LENGTH_LONG,
      });
    } else {
      function createDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = [
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          'Jack',
          'Queen',
          'King',
          'Ace',
        ];
        const deck = [];

        for (const suit of suits) {
          for (const value of values) {
            if (gameSelected === 'Memory') {
              if (value !== '8') {
                deck.push(`${value} of ${suit}`);
              }
            } else {
              deck.push(`${value} of ${suit}`);
            }
          }
        }

        return deck;
      }

      function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
      }

      function distributeDeck(deck, numPlayers) {
        const players = Array.from({length: numPlayers}, () => []);
        let currentPlayer = 0;

        while (deck.length > 0) {
          const card = deck.pop();
          players[currentPlayer].push(card);
          currentPlayer = (currentPlayer + 1) % numPlayers;
        }

        return players;
      }

      const deck = createDeck();
      shuffleDeck(deck);

      const numPlayers = roomMembers.length;
      const players = distributeDeck(deck, numPlayers);
      name = 'host';

      // Sending cards to each players
      for (let i = 0; i < numPlayers; i++) {
        let message = {
          roomId: roomId,
          type: 'Game Started',
          cardsOf: roomMembers[i],
          cards: players[i].join(', '),
          turnMessage: 'host is playing...',
        };
        ws.send(JSON.stringify(message));
      }
    }
  };

  function showParticipants() {
    return (
      <>
        <Text style={[styles.members, {marginTop: -25, marginBottom: 0}]}>
          Players
        </Text>
        {participants.map((members, index) => {
          return (
            <Text key={index} style={styles.participants}>
              {members}
            </Text>
          );
        })}
      </>
    );
  }

  const checkCard = () => {
    if (gameSelected === 'Memory') {
      if (
        activeMemberTab === null ||
        activeRankTab === null ||
        activeSuitTab === null
      ) {
        Snackbar.show({
          text: 'Please choose suit, rank and member',
          duration: Snackbar.LENGTH_LONG,
        });
      }
    } else {
      if (activeSuitTab === null || activeRankTab === null) {
        Snackbar.show({
          text: 'Please choose suit and rank',
          duration: Snackbar.LENGTH_LONG,
        });
      }
    }

    let suitString =
      activeSuitTab === 'Spade'
        ? 'Spades'
        : activeSuitTab === 'Club'
        ? 'Clubs'
        : activeSuitTab === 'Diamond'
        ? 'Diamonds'
        : activeSuitTab === 'Heart'
        ? 'Hearts'
        : null;
    let rankString =
      activeRankTab === 'A'
        ? 'Ace'
        : activeRankTab === 'J'
        ? 'Jack'
        : activeRankTab === 'Q'
        ? 'Queen'
        : activeRankTab === 'K'
        ? 'King'
        : activeRankTab;
    let checkString = `${rankString} of ${suitString}`;

    if (
      gameSelected === 'Memory' &&
      activeMemberTab !== null &&
      activeRankTab !== null &&
      activeSuitTab !== null
    ) {
      let groupCheck = '';
      if (minorSpades.includes(checkString)) {
        groupCheck = 'minorSpades';
      } else if (majorSpades.includes(checkString)) {
        groupCheck = 'majorSpades';
      } else if (minorClubs.includes(checkString)) {
        groupCheck = 'minorClubs';
      } else if (majorClubs.includes(checkString)) {
        groupCheck = 'majorClubs';
      } else if (minorDiamonds.includes(checkString)) {
        groupCheck = 'minorDiamonds';
      } else if (majorDiamonds.includes(checkString)) {
        groupCheck = 'majorDiamonds';
      } else if (minorHearts.includes(checkString)) {
        groupCheck = 'minorHearts';
      } else if (majorHearts.includes(checkString)) {
        groupCheck = 'majorHearts';
      } else {
        null;
      }

      let canAsk = false;
      if (groupCheck === 'minorSpades') {
        for (const card of yourCards) {
          if (minorSpades.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'majorSpades') {
        for (const card of yourCards) {
          if (majorSpades.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'minorClubs') {
        for (const card of yourCards) {
          if (minorClubs.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'majorClubs') {
        for (const card of yourCards) {
          if (majorClubs.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'minorDiamonds') {
        for (const card of yourCards) {
          if (minorDiamonds.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'majorDiamonds') {
        for (const card of yourCards) {
          if (majorDiamonds.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'minorHearts') {
        for (const card of yourCards) {
          if (minorHearts.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else if (groupCheck === 'majorHearts') {
        for (const card of yourCards) {
          if (majorHearts.includes(card)) {
            canAsk = true;
            break;
          }
        }
      } else {
        null;
      }

      if (canAsk === true) {
        let message = {
          roomId: roomId,
          type: 'Asking Card',
          fromPerson: name,
          toPerson: activeMemberTab,
          card: checkString,
        };
        ws.send(JSON.stringify(message));
        canAsk = false;
      } else {
        Snackbar.show({
          text: 'You cannot ask this card since base card is not there with you',
          duration: Snackbar.LENGTH_LONG,
        });
      }
    }

    if (
      (gameSelected === 'Ace' || gameSelected === 'JackAndFive') &&
      activeSuitTab !== null &&
      activeRankTab !== null
    ) {
      let canPut = false;
      let canCut = true;
      if (yourCards.includes(checkString)) {
        canPut = true;
      }
      if (canPut === true) {
        let lastIndex = roomMembers.length - 1;
        if (onGoingSuitOfTheRound === '') {
          if (name === roomMembers[lastIndex]) {
            let message = {
              roomId: roomId,
              type: 'Card Added To The Round',
              fromPerson: name,
              card: checkString,
              suit: suitString,
              turnMessage: `${roomMembers[0]} is playing...`,
              nextPerson: roomMembers[0],
            };
            ws.send(JSON.stringify(message));
          } else {
            let message = {
              roomId: roomId,
              type: 'Card Added To The Round',
              fromPerson: name,
              card: checkString,
              suit: suitString,
              turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
              nextPerson: roomMembers[yourPosition + 1],
            };
            ws.send(JSON.stringify(message));
          }
          const newArray = cards.filter(item => item !== checkString);
          setYourCards(newArray);
          cards = newArray;
          canPut = false;
          setYourTurn(false);
        }
        if (onGoingSuitOfTheRound !== '') {
          if (onGoingSuitOfTheRound === 'Spades') {
            if (suitString === onGoingSuitOfTheRound) {
              if (name === roomMembers[lastIndex]) {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[0]} is playing...`,
                  nextPerson: roomMembers[0],
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                  nextPerson: roomMembers[yourPosition + 1],
                };
                ws.send(JSON.stringify(message));
              }
              const newArray = cards.filter(item => item !== checkString);
              setYourCards(newArray);
              cards = newArray;
              canPut = false;
              setYourTurn(false);
            } else {
              for (const card of yourCards) {
                if (spadesList.includes(card)) {
                  canCut = false;
                  Snackbar.show({
                    text: 'You cannot cut this round , Since you have spades',
                    duration: Snackbar.LENGTH_LONG,
                  });
                  break;
                }
              }
              if (canCut === true) {
                if (name === roomMembers[lastIndex]) {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${roomMembers[0]} is playing...`,
                    nextPerson: roomMembers[0],
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                    nextPerson: roomMembers[yourPosition + 1],
                  };
                  ws.send(JSON.stringify(message));
                }
                const newArray = cards.filter(item => item !== checkString);
                setYourCards(newArray);
                cards = newArray;
                setYourTurn(false);
              }
            }
          }
          if (onGoingSuitOfTheRound === 'Clubs') {
            if (suitString === onGoingSuitOfTheRound) {
              if (name === roomMembers[lastIndex]) {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[0]} is playing...`,
                  nextPerson: roomMembers[0],
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                  nextPerson: roomMembers[yourPosition + 1],
                };
                ws.send(JSON.stringify(message));
              }
              const newArray = cards.filter(item => item !== checkString);
              setYourCards(newArray);
              cards = newArray;
              canPut = false;
              setYourTurn(false);
            } else {
              for (const card of yourCards) {
                if (clubsList.includes(card)) {
                  canCut = false;
                  Snackbar.show({
                    text: 'You cannot cut this round , Since you have clubs',
                    duration: Snackbar.LENGTH_LONG,
                  });
                  break;
                }
              }
              if (canCut === true) {
                if (name === roomMembers[lastIndex]) {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${roomMembers[0]} is playing...`,
                    nextPerson: roomMembers[0],
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                    nextPerson: roomMembers[yourPosition + 1],
                  };
                  ws.send(JSON.stringify(message));
                }
                const newArray = cards.filter(item => item !== checkString);
                setYourCards(newArray);
                cards = newArray;
                setYourTurn(false);
              }
            }
          }
          if (onGoingSuitOfTheRound === 'Diamonds') {
            if (suitString === onGoingSuitOfTheRound) {
              if (name === roomMembers[lastIndex]) {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[0]} is playing...`,
                  nextPerson: roomMembers[0],
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                  nextPerson: roomMembers[yourPosition + 1],
                };
                ws.send(JSON.stringify(message));
              }
              const newArray = cards.filter(item => item !== checkString);
              setYourCards(newArray);
              cards = newArray;
              canPut = false;
              setYourTurn(false);
            } else {
              for (const card of yourCards) {
                if (diamondsList.includes(card)) {
                  canCut = false;
                  Snackbar.show({
                    text: 'You cannot cut this round , Since you have diamonds',
                    duration: Snackbar.LENGTH_LONG,
                  });
                  break;
                }
              }
              if (canCut === true) {
                if (name === roomMembers[lastIndex]) {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${roomMembers[0]} is playing...`,
                    nextPerson: roomMembers[0],
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                    nextPerson: roomMembers[yourPosition + 1],
                  };
                  ws.send(JSON.stringify(message));
                }
                const newArray = cards.filter(item => item !== checkString);
                setYourCards(newArray);
                cards = newArray;
                setYourTurn(false);
              }
            }
          }
          if (onGoingSuitOfTheRound === 'Hearts') {
            if (suitString === onGoingSuitOfTheRound) {
              if (name === roomMembers[lastIndex]) {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[0]} is playing...`,
                  nextPerson: roomMembers[0],
                };
                ws.send(JSON.stringify(message));
              } else {
                let message = {
                  roomId: roomId,
                  type: 'Card Added To The Round',
                  fromPerson: name,
                  card: checkString,
                  suit: suitString,
                  turnMessage: `${roomMembers[yourPosition + 1]} is playing...`,
                  nextPerson: roomMembers[yourPosition + 1],
                };
                ws.send(JSON.stringify(message));
              }
              const newArray = cards.filter(item => item !== checkString);
              setYourCards(newArray);
              cards = newArray;
              canPut = false;
              setYourTurn(false);
            } else {
              for (const card of yourCards) {
                if (heartsList.includes(card)) {
                  canCut = false;
                  Snackbar.show({
                    text: 'You cannot cut this round , Since you have hearts',
                    duration: Snackbar.LENGTH_LONG,
                  });
                  break;
                }
              }
              if (canCut === true) {
                if (name === roomMembers[lastIndex]) {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${roomMembers[0]} is playing...`,
                    nextPerson: roomMembers[0],
                  };
                  ws.send(JSON.stringify(message));
                } else {
                  let message = {
                    roomId: roomId,
                    type: 'Round Cutted',
                    fromPerson: name,
                    card: checkString,
                    turnMessage: `${
                      roomMembers[yourPosition + 1]
                    } is playing...`,
                    nextPerson: roomMembers[yourPosition + 1],
                  };
                  ws.send(JSON.stringify(message));
                }
                const newArray = cards.filter(item => item !== checkString);
                setYourCards(newArray);
                cards = newArray;
                setYourTurn(false);
              }
            }
          }
        }
        setActiveSuitTab(null);
        setActiveRankTab(null);
      } else {
        Snackbar.show({
          text: 'You cannot put this card since this card is not with you',
          duration: Snackbar.LENGTH_LONG,
        });
      }
    }
  };

  const createRoomConfirmation = () => {
    if (activeGameTab === null) {
      Snackbar.show({
        text: 'Select The game',
        duration: Snackbar.LENGTH_LONG,
      });
    } else {
      setGameSelectionScreen(false);
      createRoomServer();
    }
  };

  return (
    <SafeAreaView
      style={[styles.flex, {backgroundColor: theme.backgroundColor}]}>
      {!createRoom &&
        !joinRoom &&
        !gameScreen &&
        !endGameScreen &&
        !gameSelectionScreen &&
        !rulesScreen && (
          <View style={styles.container1}>
            <View style={styles.roomContainer1}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setRulesScreen(true);
                }}>
                <Text style={styles.buttonText}>GameRules</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Exit Game</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.roomContainer2}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setGameSelectionScreen(true);
                }}>
                <Text style={styles.buttonText}>Create Room</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setJoinRoom(true);
                }}>
                <Text style={styles.buttonText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      {rulesScreen && (
        <View style={styles.flex}>
          <ScrollView style={{display: 'flex', flex: 0.7}}>
            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 20,
                marginRight: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  color: 'orange',
                  marginBottom: 10,
                }}>
                Memory
              </Text>
              {MemoryRules.map((rule, index) => {
                return (
                  <Text key={index} style={{color: 'white', fontSize: 16}}>
                    🙄 {rule}
                  </Text>
                );
              })}
            </View>
            <View
              style={{
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginTop: 5,
              }}
            />
            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 20,
                marginRight: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  color: 'orange',
                  marginBottom: 10,
                }}>
                Ace
              </Text>
              {AceRules.map((rule, index) => {
                return (
                  <Text key={index} style={{color: 'white', fontSize: 16}}>
                    🙄 {rule}
                  </Text>
                );
              })}
            </View>
            <View
              style={{
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginTop: 5,
              }}
            />
            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 20,
                marginRight: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  color: 'orange',
                  marginBottom: 10,
                }}>
                Jack And Five
              </Text>
              {JackAndFiveRules.map((rule, index) => {
                return (
                  <Text key={index} style={{color: 'white', fontSize: 16}}>
                    🙄 {rule}
                  </Text>
                );
              })}
            </View>
            <View
              style={{
                borderBottomColor: 'gray',
                borderBottomWidth: 1,
                marginTop: 5,
              }}
            />
          </ScrollView>
          <TouchableOpacity
            style={[
              styles.button,
              {alignSelf: 'center', marginTop: 10, marginBottom: 10},
            ]}
            onPress={() => {
              setRulesScreen(false);
            }}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
      {gameSelectionScreen && (
        <Modal
          isVisible={gameSelectionScreen}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={styles.roomContainer5}>
          <View style={styles.modalContainer3}>
            <Text style={styles.modalText}>
              Select the Game You Want to Play in this Room
            </Text>
            <View
              style={{
                flexDirection: 'row',
                width: '70%',
                height: 25,
                marginTop: 20,
              }}>
              {gamesList.map(item => {
                return (
                  <GameSelectionTab
                    key={item}
                    label={item}
                    isActive={activeGameTab === item}
                    onPress={() => {
                      setActiveGameTab(item);
                      gameSelected = item;
                    }}
                  />
                );
              })}
            </View>
            <View style={styles.roomContainer2}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setGameSelectionScreen(false);
                  setActiveGameTab(null);
                  gameSelected = '';
                }}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={createRoomConfirmation}>
                <Text style={styles.buttonText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {createRoom && !gameScreen && !endGameScreen && (
        <>
          <View style={styles.container2}>
            <View style={styles.roomContainer3}>{showParticipants()}</View>
            <View style={[styles.container1]}>
              <Text style={[styles.message, {marginBottom: -30}]}>
                {message}
              </Text>
              <Text
                style={[
                  styles.message,
                  {marginBottom: 0},
                ]}>{`Game:${activeGameTab}`}</Text>
              <View style={[styles.roomContainer4, {bottom: -20}]}>
                <TouchableOpacity style={styles.button} onPress={playGame}>
                  <Text style={styles.buttonText}>Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={deleteRoom}>
                  <Text style={styles.buttonText}>Delete Room</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={toggleKickPlayerDialogModal}>
                  <Text style={styles.buttonText}>Kick Player</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Modal
            isVisible={isModalVisible}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={styles.roomContainer5}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Enter The Player Name You Want To Kick
              </Text>
              <TextInput
                placeholder="Enter Player Name"
                value={playerToBeKicked}
                placeholderTextColor={'#AEAEAE'}
                onChangeText={text => {
                  setPlayerToBeKicked(text);
                }}
                style={styles.input}
              />
              <View style={styles.roomContainer4}>
                <TouchableOpacity style={styles.button} onPress={kickPlayer}>
                  <Text style={styles.buttonText}>kick</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={toggleKickPlayerDialogModal}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
      {joinRoom && !joinedRoom && !gameScreen && !endGameScreen && (
        <View style={styles.container1}>
          <View>
            <TextInput
              placeholder="Enter Room ID"
              value={enteredRoomId}
              placeholderTextColor={'#AEAEAE'}
              onChangeText={text => {
                setEnteredRoomId(text);
                roomId = text;
              }}
              style={styles.input}
            />
            <TextInput
              placeholder="Create a name for you"
              value={enteredName}
              placeholderTextColor={'#AEAEAE'}
              onChangeText={text => {
                setEnteredName(text);
                name = text;
              }}
              style={styles.input}
            />
            <View style={[styles.roomContainer4, styles.left]}>
              <TouchableOpacity style={styles.button} onPress={joinRoomServer}>
                <Text style={styles.buttonText}>Join</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setJoinRoom(false);
                  setEnteredRoomId('');
                  setEnteredName('');
                  name = '';
                  roomId = '';
                }}>
                <Text style={styles.buttonText}>back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {joinRoom && joinedRoom && !gameScreen && !endGameScreen && (
        <View style={styles.container2}>
          <View style={styles.roomContainer3}>{showParticipants()}</View>
          <View style={styles.container1}>
            <Text style={[styles.message, {marginBottom: -30}]}>{message}</Text>
            <Text
              style={[
                styles.message,
                {marginBottom: 0},
              ]}>{`Game:${activeGameTab}`}</Text>
            <TouchableOpacity
              style={[styles.button, {bottom: -20}]}
              onPress={leaveRoomServer}>
              <Text style={styles.buttonText}>Leave Room</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {gameScreen && !endGameScreen && (
        <View style={styles.flex}>
          <View style={styles.container4}>
            <View style={styles.roomContainer7}>
              <Text style={styles.turnText}>
                {turnMessage !== '' ? turnMessage : null}
              </Text>
              {fromPerson !== '' &&
                toPerson !== '' &&
                askedCardRank !== '' &&
                askedCardSuit !== '' &&
                gameSelected === 'Memory' && (
                  <View style={styles.roomContainer8}>
                    <Text
                      style={[styles.turnText, styles.roomContainer8Spacing]}>
                      {fromPerson}
                    </Text>
                    <Icon
                      style={styles.roomContainer8Spacing}
                      name="forward"
                      color={'#FF6700'}
                    />
                    <Card
                      rank={askedCardRank}
                      suit={askedCardSuit}
                      bigCard={true}
                    />
                    <Icon
                      style={styles.roomContainer8Spacing}
                      name="forward"
                      color={'#FF6700'}
                    />
                    <Text style={styles.turnText}>{toPerson}</Text>
                  </View>
                )}
              {responseForTheCard !== '' && gameSelected === 'Memory' && (
                <Text style={styles.turnText}>
                  {responseForTheCard === 'correct'
                    ? `Correct Guess! . ${fromPerson} will continue.. `
                    : responseForTheCard === 'wrong'
                    ? `Worng Guess`
                    : null}
                </Text>
              )}
              {(gameSelected === 'Ace' || gameSelected === 'JackAndFive') &&
                cardDeliveredInOrder.length > 0 &&
                roundOrder.length > 0 && (
                  <>
                    <View style={{display: 'flex', justifyContent: 'center'}}>
                      <Text style={styles.turnText}>Round Info</Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{display: 'flex', flexDirection: 'row'}}>
                      {cardDeliveredInOrder.map((item, index) => {
                        let spliting = item.split('of');
                        let rank = spliting[0];
                        let suit = spliting[1];
                        return (
                          <Card
                            key={index}
                            rank={rank}
                            suit={suit}
                            person={roundOrder[index]}
                            cardWithPerson={true}
                          />
                        );
                      })}
                    </ScrollView>
                  </>
                )}
            </View>

            {yourTurn && (
              <Modal
                isVisible={yourTurn}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                style={styles.roomContainer5}>
                <ScrollView style={styles.scrollView}>
                  <View style={styles.modalContainer2}>
                    <Text style={[styles.modalText2, {textAlign: 'center'}]}>
                      {gameSelected === 'Memory'
                        ? 'Select the Suit, Rank and the Player you want to ask the card'
                        : 'Select the Suit, and Rank of the card you are willing to put'}
                    </Text>
                    <View style={styles.subRoomContainer1}>
                      <Text style={styles.modalText3}>Select the Suit</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '60%',
                          height: 25,
                        }}>
                        {globalSuit.map(item => {
                          return (
                            <CardAndMemberSelectionTab
                              key={item}
                              label={item}
                              isActive={activeSuitTab === item}
                              onPress={() => handleSuitTabPress(item)}
                            />
                          );
                        })}
                      </View>
                    </View>
                    <View style={styles.subRoomContainer1}>
                      <Text style={styles.modalText3}>Select the Rank</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: gameSelected === 'Memory' ? '70%' : '58%',
                          height: 25,
                        }}>
                        {gameSelected === 'Memory'
                          ? globalRankInMemoryGame.map(item => {
                              return (
                                <CardAndMemberSelectionTab
                                  key={item}
                                  label={item}
                                  isActive={activeRankTab === item}
                                  onPress={() => handleRankTabPress(item)}
                                />
                              );
                            })
                          : globalRank.map(item => {
                              return (
                                <CardAndMemberSelectionTab
                                  key={item}
                                  label={item}
                                  isActive={activeRankTab === item}
                                  onPress={() => handleRankTabPress(item)}
                                />
                              );
                            })}
                      </View>
                    </View>
                    {gameSelected === 'Memory' && (
                      <View style={styles.subRoomContainer1}>
                        <Text style={styles.modalText3}>Select the Player</Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            width: '80%',
                            height: 25,
                          }}>
                          {membersYouCanAsk.map(item => {
                            return (
                              <CardAndMemberSelectionTab
                                key={item}
                                label={item}
                                isActive={activeMemberTab === item}
                                onPress={() => handleMemberTabPress(item)}
                                name={true}
                              />
                            );
                          })}
                        </View>
                      </View>
                    )}
                    <View style={[styles.roomContainer4, {marginTop: 10}]}>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={checkCard}>
                        <Text style={styles.buttonText}>Ok</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                          setViewCardsScreen(true);
                          setYourTurn(false);
                        }}>
                        <Text style={styles.buttonText}>View Cards</Text>
                      </TouchableOpacity>
                      {(gameSelected === 'Ace' ||
                        gameSelected === 'JackAndFive') &&
                        cardDeliveredInOrder.length > 0 &&
                        roundOrder.length > 0 && (
                          <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                              setRoundInfoScreen(true);
                              setYourTurn(false);
                            }}>
                            <Text style={styles.buttonText}>Round Info</Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>
                </ScrollView>
              </Modal>
            )}
            {viewCardsScreen && (
              <Modal
                isVisible={viewCardsScreen}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                style={styles.roomContainer5}>
                <View style={styles.modalContainer4}>
                  <Text style={styles.modalText2}>Your Cards</Text>
                  <FlatList
                    data={yourCards}
                    renderItem={({item}) => {
                      let spliting = item.split('of');
                      let rank = spliting[0];
                      let suit = spliting[1];
                      return <Card key={item} rank={rank} suit={suit} />;
                    }}
                    keyExtractor={item => item}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                  />
                  <TouchableOpacity
                    style={[styles.button, {marginTop: 20}]}
                    onPress={() => {
                      setViewCardsScreen(false);
                      setYourTurn(true);
                    }}>
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
            {roundInfoScreen && (
              <Modal
                isVisible={roundInfoScreen}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                style={styles.roomContainer5}>
                <View style={styles.modalContainer4}>
                  <Text style={styles.modalText2}>Round Info</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{display: 'flex', flexDirection: 'row'}}>
                    {cardDeliveredInOrder.map((item, index) => {
                      let spliting = item.split('of');
                      let rank = spliting[0];
                      let suit = spliting[1];
                      return (
                        <Card
                          key={index}
                          rank={rank}
                          suit={suit}
                          person={roundOrder[index]}
                          cardWithPerson={true}
                        />
                      );
                    })}
                  </ScrollView>
                  <TouchableOpacity
                    style={[styles.button, {marginTop: 20}]}
                    onPress={() => {
                      setRoundInfoScreen(false);
                      setYourTurn(true);
                    }}>
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
          </View>
          <View style={styles.container5}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {yourCards.map((cardString, index) => {
                let spliting = cardString.split('of');
                let rank = spliting[0];
                let suit = spliting[1];
                return <Card key={index} rank={rank} suit={suit} />;
              })}
            </ScrollView>
          </View>
        </View>
      )}
      {endGameScreen && (
        <View style={styles.container6}>
          {(gameSelected === 'Memory' || gameSelected === 'JackAndFive') && (
            <View style={styles.roomContainer9}>
              <View>
                <Text style={[styles.turnText, styles.endScreenHeading]}>
                  Player
                </Text>
                {endResult.map(item => {
                  return (
                    <Text
                      style={[styles.endScreenText, styles.endScreenHeading]}>
                      {item.player}
                    </Text>
                  );
                })}
              </View>
              <View>
                <Text style={[styles.turnText, styles.endScreenHeading]}>
                  Points
                </Text>
                {endResult.map(item => {
                  return (
                    <Text
                      style={[styles.endScreenText, styles.endScreenHeading]}>
                      {item.points}
                    </Text>
                  );
                })}
              </View>
            </View>
          )}
          {gameSelected === 'Ace' && (
            <View>
              <Text style={[styles.turnText, styles.endScreenHeading]}>
                Winning Order
              </Text>
              {endResult.map(item => {
                return (
                  <Text style={[styles.endScreenText, styles.endScreenHeading]}>
                    {item}
                  </Text>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleExit}>
            <Text style={styles.buttonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container1: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  roomContainer1: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 40,
  },
  roomContainer2: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    columnGap: 20,
  },
  container2: {
    flex: 1,
    alignItems: 'center',
  },
  roomContainer3: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 30,
  },
  members: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5dbea3',
    marginBottom: 5,
  },
  participants: {
    color: '#80669d',
    marginBottom: 3,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5dbea3',
    marginBottom: 20,
  },
  roomContainer4: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 20,
  },
  input: {
    backgroundColor: '#fef8fa',
    padding: 10,
    height: 40,
    alignSelf: 'center',
    borderRadius: 5,

    width: 160,
    color: '#000000',

    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 1,
  },
  left: {
    left: 20,
  },
  button: {
    backgroundColor: '#80669d',
    borderRadius: 10,
    height: 40,
  },
  buttonText: {
    color: '#5dbea3',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    alignSelf: 'center',
  },
  roomContainer5: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  modalContainer: {
    backgroundColor: '#5dbea3',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '40%',
  },
  modalText: {
    fontWeight: 'bold',
    color: '#80669d',
    marginBottom: 10,
  },
  container4: {
    flex: 0.63,
  },
  container5: {
    flex: 0.37,
    position: 'absolute',
    bottom: 10,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  roomContainer6: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 70,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginRight: 5,
  },
  cardTextRed: {
    color: '#FF0000',
    fontWeight: '600',
  },
  cardTextBlack: {
    color: '#000000',
    fontWeight: '600',
  },
  roomContainer7: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 10,
  },
  turnText: {
    fontWeight: '600',
    color: '#FF6700',
  },
  modalContainer2: {
    flex: 1,
    backgroundColor: '#5dbea3',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  modalText2: {
    fontWeight: '900',
    color: '#783937',
    fontSize: 20,
    marginBottom: 10,
  },
  modalText3: {
    fontWeight: 'bold',
    color: '#80669d',
    marginBottom: 5,
    marginTop: 5,
  },
  subRoomContainer1: {
    display: 'flex',
    flexDirection: 'column',
    columnGap: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#00539C',
  },
  inactiveTab: {
    backgroundColor: '#80669d',
  },
  activeText: {
    color: '#EEA47F',
  },
  inactiveText: {
    color: '#5dbea3',
    fontWeight: 'bold',
  },
  modalContainer3: {
    backgroundColor: '#5dbea3',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalContainer4: {
    backgroundColor: '#5dbea3',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  roomContainer8: {
    display: 'flex',
    flexDirection: 'row',
    rowGap: 20,
    alignItems: 'center',
  },
  roomContainer8Spacing: {
    marginRight: 20,
  },
  bigCard: {
    width: 70,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginRight: 20,
  },
  container6: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomContainer9: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  endScreenHeading: {
    marginBottom: 8,
  },
  endScreenText: {
    color: '#5dbea3',
  },
  scrollView: {
    maxHeight: '100%',
  },
});
