import { ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, TouchableWithoutFeedback, FlatList } from 'react-native'
import React, { useContext, useState, useEffect } from 'react'
import spadeImage from './spade.jpg'
import clubImage from './club.jpg'
import diamondImage from './diamond.jpg'
import heartImage from './heart.jpg'
import { Dimensions } from 'react-native'
import Snackbar from 'react-native-snackbar'
import { NavigationContainer } from '@react-navigation/native'
import Orientation from 'react-native-orientation-locker'
import axios from 'axios'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/FontAwesome'
import { ThemeProvider, useTheme } from '.././ThemeContext';

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

    const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
    const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
    const { theme } = useTheme();
    const [websocketConnected, setWebsocketConnected] = useState(false);

    let gamesList = ["Memory", "Ace", "JackAndFive"];
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
    const [cardAsked, setCardAsked] = useState('');
    const [responseForTheCard, setResponseForTheCard] = useState('');
    const [askedCardRank, setAskedCardRank] = useState('');
    const [askedCardSuit, setAskedCardSuit] = useState('');
    const [endGameScreen, setEndGameScreen] = useState(false);

    const handleDimensionsChange = ({ window }) => {
        setScreenWidth(window.width);
        setScreenHeight(window.height);
    };

    const toggleKickPlayerDialogModal = () => {
        setModalVisible(!isModalVisible);
        if (playerToBeKicked !== '') {
            setPlayerToBeKicked('');
        }
    };

    // Establish a WebSocket connection when the component mounts
    const ws = new WebSocket('ws://13.71.92.130:5000');

    const minorSpades = ["2 of Spades", "3 of Spades", "4 of Spades", "5 of Spades", "6 of Spades", "7 of Spades"];
    const majorSpades = ["9 of Spades", "10 of Spades", "Jack of Spades", "Queen of Spades", "King of Spades", "Ace of Spades"];
    const minorClubs = ["2 of Clubs", "3 of Clubs", "4 of Clubs", "5 of Clubs", "6 of Clubs", "7 of Clubs"];
    const majorClubs = ["9 of Clubs", "10 of Clubs", "Jack of Clubs", "Queen of Clubs", "King of Clubs", "Ace of Clubs"];
    const minorDiamonds = ["2 of Diamonds", "3 of Diamonds", "4 of Diamonds", "5 of Diamonds", "6 of Diamonds", "7 of Diamonds"];
    const majorDiamonds = ["9 of Diamonds", "10 of Diamonds", "Jack of Diamonds", "Queen of Diamonds", "King of Diamonds", "Ace of Diamonds"];
    const minorHearts = ["2 of Hearts", "3 of Hearts", "4 of Hearts", "5 of Hearts", "6 of Hearts", "7 of Hearts"];
    const majorHearts = ["9 of Hearts", "10 of Hearts", "Jack of Hearts", "Queen of Hearts", "King of Hearts", "Ace of Hearts",];

    const spadesList = ["2 of Spades", "3 of Spades", "4 of Spades", "5 of Spades", "6 of Spades", "7 of Spades", "8 of Spades", "9 of Spades", "10 of Spades", "Jack of Spades", "Queen of Spades", "King of Spades", "Ace of Spades"];
    const clubsList = ["2 of Clubs", "3 of Clubs", "4 of Clubs", "5 of Clubs", "6 of Clubs", "7 of Clubs", "8 of Clubs", "9 of Clubs", "10 of Clubs", "Jack of Clubs", "Queen of Clubs", "King of Clubs", "Ace of Clubs"];
    const diamondsList = ["2 of Diamonds", "3 of Diamonds", "4 of Diamonds", "5 of Diamonds", "6 of Diamonds", "7 of Diamonds", "8 of Diamonds", "9 of Diamonds", "10 of Diamonds", "Jack of Diamonds", "Queen of Diamonds", "King of Diamonds", "Ace of Diamonds"];
    const heartsList = ["2 of Hearts", "3 of Hearts", "4 of Hearts", "5 of Hearts", "6 of Hearts", "7 of Hearts", "8 of Hearts", "9 of Hearts", "10 of Hearts", "Jack of Hearts", "Queen of Hearts", "King of Hearts", "Ace of Hearts"];

    const cardOrder = {
        'Ace': 13,
        'King': 12,
        'Queen': 11,
        'Jack': 10,
        '10': 9,
        '9': 8,
        '8': 7,
        '7': 6,
        '6': 5,
        '5': 4,
        '4': 3,
        '3': 2,
        '2': 1
    };

    const suitOrder = {
        'Spades': 4,
        'Clubs': 3,
        'Diamonds': 2,
        'Hearts': 1
    }

    let globalSuit = ["Spade", "Club", "Diamond", "Heart"];
    const [activeSuitTab, setActiveSuitTab] = useState(null);
    const handleSuitTabPress = (item) => {
        setActiveSuitTab(item);
    };

    let globalRank = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    let globalRankInMemoryGame = ["2", "3", "4", "5", "6", "7", "9", "10", "J", "Q", "K", "A"];
    const [activeRankTab, setActiveRankTab] = useState(null);
    const handleRankTabPress = (item) => {
        setActiveRankTab(item);
    };

    const [activeMemberTab, setActiveMemberTab] = useState(null);
    const handleMemberTabPress = (item) => {
        setActiveMemberTab(item);
    };

    const GameSelectionTab = ({ label, isActive, onPress, name }) => {
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
            return str.slice(0, maxLength - 2) + "..";
        } else {
            return str;
        }
    };

    const Card = ({ rank, suit, bigCard, person, cardWithPerson }) => {
        const trimmedSuit = suit.trim();
        const trimmedRank = rank.trim();
        return (
            <View style={bigCard ? styles.bigCard : styles.card}>
                <Text style={(trimmedSuit === 'Hearts' || trimmedSuit === 'Diamonds') ? styles.cardTextRed : styles.cardTextBlack}>{(trimmedRank === 'King') ? "K" : (trimmedRank === 'Queen') ? "Q" : (trimmedRank === 'Jack') ? "J" : (trimmedRank === 'Ace') ? "A" : rank}</Text>
                <Text style={(trimmedSuit === 'Hearts' || trimmedSuit === 'Diamonds') ? styles.cardTextRed : styles.cardTextBlack}>{suit}</Text>
                {(trimmedSuit === "Spades") ?
                    <ImageBackground
                        source={spadeImage}
                        style={{ width: 20, height: 20 }}>
                    </ImageBackground> :
                    (trimmedSuit === "Clubs") ?
                        <ImageBackground
                            source={clubImage}
                            style={{ width: 20, height: 20 }}>
                        </ImageBackground> :
                        (trimmedSuit === "Diamonds") ?
                            <ImageBackground
                                source={diamondImage}
                                style={{ width: 20, height: 20 }}>
                            </ImageBackground> :
                            (trimmedSuit === "Hearts") ?
                                <ImageBackground
                                    source={heartImage}
                                    style={{ width: 20, height: 20 }}>
                                </ImageBackground> :
                                null
                }
                <Text>{cardWithPerson ? `(${truncateString(person, 6)})` : null}</Text>
            </View>
        );
    };

    const CardAndMemberSelectionTab = ({ label, isActive, onPress, name }) => {
        const tabStyle = isActive ? styles.activeTab : styles.inactiveTab;
        const textStyles = isActive ? styles.activeText : styles.inactiveText;

        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <View style={[styles.tab, tabStyle]}>
                    <Text style={textStyles}>{(name === true) ? truncateString(label, 6) : label}</Text>
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
    };

    function removeElementsFromArray(arr1, arr2) {
        return arr1.filter(item => !arr2.includes(item));
    };

    function solobaseCaptureChecking() {
        if (areAllElementsPresent(cards, minorSpades)) {
            const resultArray = removeElementsFromArray(cards, minorSpades);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "minorSpades" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, majorSpades)) {
            const resultArray = removeElementsFromArray(cards, majorSpades);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "majorSpades" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, minorClubs)) {
            const resultArray = removeElementsFromArray(cards, minorClubs);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "minorClubs" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, majorClubs)) {
            const resultArray = removeElementsFromArray(cards, majorClubs);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "majorClubs" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, minorDiamonds)) {
            const resultArray = removeElementsFromArray(cards, minorDiamonds);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "minorDiamonds" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, majorDiamonds)) {
            const resultArray = removeElementsFromArray(cards, majorDiamonds);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "majorDiamonds" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, minorHearts)) {
            const resultArray = removeElementsFromArray(cards, minorHearts);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "minorHearts" }
            ws.send(JSON.stringify(message));
        }
        if (areAllElementsPresent(cards, majorHearts)) {
            const resultArray = removeElementsFromArray(cards, majorHearts);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": name, "baseCaptured": "majorHearts" }
            ws.send(JSON.stringify(message));
        }
    };

    function duoBaseCaptureChecking() {
        let message = { "roomId": roomId, "type": "Asking Partner Cards", "fromPerson": name, "toPerson": partner }
        ws.send(JSON.stringify(message));
        let combainedCardsArray = [];
        cards.map((card) => {
            combainedCardsArray.push(card);
        })
        partnerCards.map((card) => {
            combainedCardsArray.push(card);
        })

        if (areAllElementsPresent(combainedCardsArray, minorSpades)) {
            const resultArray = removeElementsFromArray(cards, minorSpades);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "minorSpades" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorSpades" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorSpades" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "minorSpades" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, majorSpades)) {
            const resultArray = removeElementsFromArray(cards, majorSpades);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "majorSpades" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorSpades" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorSpades" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "majorSpades" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, minorClubs)) {
            const resultArray = removeElementsFromArray(cards, minorClubs);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "minorClubs" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorClubs" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorClubs" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "minorClubs" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, majorClubs)) {
            const resultArray = removeElementsFromArray(cards, majorClubs);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "majorClubs" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorClubs" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorClubs" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "majorClubs" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, minorDiamonds)) {
            const resultArray = removeElementsFromArray(cards, minorDiamonds);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "minorDiamonds" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorDiamonds" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorDiamonds" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "minorDiamonds" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, majorDiamonds)) {
            const resultArray = removeElementsFromArray(cards, majorDiamonds);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "majorDiamonds" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorDiamonds" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorDiamonds" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "majorDiamonds" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, minorHearts)) {
            const resultArray = removeElementsFromArray(cards, minorHearts);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "minorHearts" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorHearts" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "minorHearts" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "minorHearts" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
        if (areAllElementsPresent(combainedCardsArray, majorHearts)) {
            const resultArray = removeElementsFromArray(cards, majorHearts);
            cards = resultArray;
            setYourCards(resultArray);
            let message = { "roomId": roomId, "type": "Removing Cards From Partner", "fromPerson": name, "toPerson": partner, "baseCaptured": "majorHearts" }
            ws.send(JSON.stringify(message));
            if (roomMembers.length === 6 || roomMembers.length === 8) {
                if (roomMembers.length === 6 && yourPosition > 2) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorHearts" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else if (roomMembers.length === 8 && yourPosition > 3) {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${partner} and ${name}`, "baseCaptured": "majorHearts" }
                    ws.send(JSON.stringify(secondmessage));
                }
                else {
                    let secondmessage = { "roomId": roomId, "type": "Base Captured Message", "fromPerson": `${name} and ${partner}`, "baseCaptured": "majorHearts" }
                    ws.send(JSON.stringify(secondmessage));
                }
            }
        }
    };

    function findLargestCard(cardList) {
        let largestCard = cardList[0].split(' of ');
        largestCard = largestCard[0];
        for (let i = 1; i < cardList.length; i++) {
            let checkCard = cardList[i].split(' of ')
            if (cardOrder[checkCard[0]] > cardOrder[largestCard]) {
                largestCard = checkCard[0];
            }
        }
        return largestCard;
    };

    function JackAndFiveRoundWinningCardCheckFunction(cardList, suit) {
        let roundWinningCard = '';
        let cardsNotOfSameSuit = [];
        cardList.map((item) => {
            let itemSuit = item.split(' of ');
            itemSuit = itemSuit[1];
            if (itemSuit !== suit) {
                cardsNotOfSameSuit.push(item)
            }
        })

        if (cardsNotOfSameSuit.length > 1) {
            let largestCard = cardsNotOfSameSuit[0].split(' of ');
            let largestCardRank = largestCard[0];
            let largestCardSuit = largestCard[1];
            for (let i = 1; i < cardsNotOfSameSuit.length; i++) {
                let checkCard = cardsNotOfSameSuit[i].split(' of ')
                if (cardOrder[checkCard[0]] > cardOrder[largestCardRank]) {
                    largestCardRank = checkCard[0];
                    largestCardSuit = checkCard[1];
                }
                else if (cardOrder[checkCard[0]] === cardOrder[largestCardRank]) {
                    if (suitOrder[checkCard[1] > suitOrder[largestCardSuit]]) {
                        largestCardRank = checkCard[0];
                        largestCardSuit = checkCard[1];
                    }
                }
            }
            roundWinningCard = `${largestCardRank} of ${largestCardSuit}`
        }
        else if (cardsNotOfSameSuit.length === 1) {
            roundWinningCard = cardsNotOfSameSuit[0];
        }
        else {
            let largestCard = cardList[0].split(' of ');
            largestCard = largestCard[0];
            for (let i = 1; i < cardList.length; i++) {
                let checkCard = cardList[i].split(' of ')
                if (cardOrder[checkCard[0]] > cardOrder[largestCard]) {
                    largestCard = checkCard[0];
                }
            }
            roundWinningCard = `${largestCard} of ${suit}`
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
            playerPointsArray.push({ player, points: playerPoints[player] });
        }

        playerPointsArray.sort((a, b) => b.points - a.points);

        return playerPointsArray;
    };

    useEffect(() => {
        Dimensions.addEventListener('change', handleDimensionsChange);

        ws.onopen = (event) => {
            console.log('WebSocket connection opened:', event);
            setWebsocketConnected(true);
        };

        ws.onclose = (event) => {
            console.log('WebSocket closed:', event);
            setWebsocketConnected(false);
        };

        ws.onerror = (event) => {
            console.log('WebSocket error:', event);
            setWebsocketConnected(false);
        };

        ws.onmessage = (event) => {
            const resp = JSON.parse(event.data);
            if (resp.roomId === roomId) {
                if (resp.type === "delete") {
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
                        duration: Snackbar.LENGTH_LONG
                    })
                }

                if (resp.type === "kicked" && resp.sender === name) {
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
                        duration: Snackbar.LENGTH_LONG
                    })
                }

                if (resp.type === "Fetching GameName" && resp.toPerson === name) {
                    let message = { "roomId": roomId, "type": "Fetching GameName Response", "gameName": gameSelected, "fromPerson": 'host' }
                    ws.send(JSON.stringify(message));
                }

                if (resp.type === "Fetching GameName Response" && resp.fromPerson !== name) {
                    setActiveGameTab(resp.gameName);
                    gameSelected = resp.gameName
                }

                if (resp.type === "Game Started" && resp.cardsOf === name) {
                    if (roomMembers.length === 4 && gameSelected === "Memory") {
                        Snackbar.show({
                            text: "Game Started\nOnly 4 participants are there so no teaming . All are individual Players",
                            duration: Snackbar.LENGTH_LONG,
                            numberOfLines: 2
                        })
                    }
                    else if (roomMembers.length === 6 && gameSelected === "Memory") {
                        roomMembers.map((item, index) => {
                            if (item === name) {
                                if (index < 3) {
                                    partner = roomMembers[index + 3]
                                }
                                else {
                                    partner = roomMembers[index - 3]
                                }
                            }
                        })
                        Snackbar.show({
                            text: `Game Started\n${roomMembers[0]} and ${roomMembers[3]} are team\n${roomMembers[1]} and ${roomMembers[4]} are team\n${roomMembers[2]} and ${roomMembers[5]} are team`,
                            duration: Snackbar.LENGTH_LONG,
                            numberOfLines: 4
                        })
                    }
                    else if (roomMembers.length === 8 && gameSelected === "Memory") {
                        roomMembers.map((item, index) => {
                            if (item === name) {
                                if (index < 4) {
                                    partner = roomMembers[index + 4]
                                }
                                else {
                                    partner = roomMembers[index - 4]
                                }
                            }
                        })
                        Snackbar.show({
                            text: `Game Started\n${roomMembers[0]} and ${roomMembers[4]} are team\n${roomMembers[1]} and ${roomMembers[5]} are team\n${roomMembers[2]} and ${roomMembers[6]} are team\n${roomMembers[3]} and ${roomMembers[7]} are team`,
                            duration: Snackbar.LENGTH_LONG,
                            numberOfLines: 5
                        })
                    }
                    else if (gameSelected === "Ace") {
                        Snackbar.show({
                            text: `Game Started`,
                            duration: Snackbar.LENGTH_LONG,
                            numberOfLines: 1
                        })
                    }
                    else if (gameSelected === "JackAndFive") {
                        roomMembers.map((item, index) => {
                            if (item === name) {
                                if (index < 2) {
                                    partner = roomMembers[index + 2]
                                }
                                else {
                                    partner = roomMembers[index - 2]
                                }
                            }
                        })
                        Snackbar.show({
                            text: `Game Started\n${roomMembers[0]} and ${roomMembers[2]} are team\n${roomMembers[1]} and ${roomMembers[3]} are team`,
                            duration: Snackbar.LENGTH_LONG,
                            numberOfLines: 3
                        })
                    }
                    console.log(resp);
                    const cardString = resp.cards;
                    const cardArray = cardString.split(', ');
                    setYourCards(cardArray);
                    cards = cardArray;
                    roomMembers.map((item, index) => {
                        if (item === name) {
                            yourPosition = index
                        }
                    })
                    setTurnMessage(resp.turnMessage);
                    if (gameSelected === "Memory") {
                        roomMembers.map((item) => {
                            if (roomMembers.length === 4) {
                                if (item !== name) {
                                    membersYouCanAsk.push(item);
                                }

                            }
                            else {
                                if (item !== name && item !== partner) {
                                    membersYouCanAsk.push(item);
                                }
                                let message = { "roomId": roomId, "type": "Asking Partner Cards", "fromPerson": name, "toPerson": partner }
                                ws.send(JSON.stringify(message));
                            }
                        })
                    }
                    if (resp.turnMessage === `${name} is playing...`) {
                        setYourTurn(true);
                    }
                    setGameScreen(true);
                }

                if (resp.type === "Asking Card" && resp.toPerson === name) {
                    console.log(resp);
                    if (cards.includes(resp.card)) {
                        const newArray = cards.filter(item => item !== resp.card);
                        setYourCards(newArray);
                        cards = newArray
                        let message = { "roomId": roomId, "type": "Asked Card Response", "fromPerson": name, "toPerson": resp.fromPerson, "response": "Yes", "card": resp.card }
                        ws.send(JSON.stringify(message));
                    } else {
                        let message = { "roomId": roomId, "type": "Asked Card Response", "fromPerson": name, "toPerson": resp.fromPerson, "response": "No" }
                        ws.send(JSON.stringify(message));
                    }
                }

                if (resp.type === "Asking Card") {
                    setFromPerson(resp.fromPerson);
                    setToPerson(resp.toPerson);
                    setCardAsked(resp.card);
                    let spliting = resp.card.split("of");
                    setAskedCardRank(spliting[0]);
                    setAskedCardSuit(spliting[1]);
                }

                if (resp.type === "Asked Card Response" && resp.toPerson === name) {
                    console.log(resp);

                    if (resp.response === "Yes") {
                        yourCards.push(resp.card);
                        cards.push(resp.card);
                        setActiveMemberTab(null);
                        setActiveSuitTab(null);
                        setActiveRankTab(null);
                        Snackbar.show({
                            text: 'your guess is correct and card is added in your cards list, continue your guess',
                            duration: Snackbar.LENGTH_LONG
                        });

                        if (roomMembers.length === 4) {
                            solobaseCaptureChecking()
                        }

                        if (roomMembers.length === 6 || roomMembers.length === 8) {
                            duoBaseCaptureChecking()
                        }
                    }
                    if (resp.response === "No") {
                        setActiveMemberTab(null);
                        setActiveSuitTab(null);
                        setActiveRankTab(null);
                        if (roomMembers.length === 4) {
                            if (name === roomMembers[3]) {
                                let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[0], "turnMessage": `${roomMembers[0]} is playing...` }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[yourPosition + 1], "turnMessage": `${roomMembers[yourPosition + 1]} is playing...` }
                                ws.send(JSON.stringify(message));
                            }
                        }
                        if (roomMembers.length === 6) {
                            if (name === roomMembers[5]) {
                                let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[0], "turnMessage": `${roomMembers[0]} is playing...` }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[yourPosition + 1], "turnMessage": `${roomMembers[yourPosition + 1]} is playing...` }
                                ws.send(JSON.stringify(message));
                            }

                        }
                        if (roomMembers.length === 8) {
                            if (name === roomMembers[7]) {
                                let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[0], "turnMessage": `${roomMembers[0]} is playing...` }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[yourPosition + 1], "turnMessage": `${roomMembers[yourPosition + 1]} is playing...` }
                                ws.send(JSON.stringify(message));
                            }
                        }
                        setYourTurn(false);
                    }
                }

                if (resp.type === "Asked Card Response") {
                    if (resp.response === "Yes") {
                        setResponseForTheCard("correct")
                    }
                    if (resp.response === "No") {
                        setResponseForTheCard("wrong");
                    }
                }

                if (resp.type === "Next Turn") {
                    console.log(resp);
                    if (resp.nextPerson === name) {
                        if (cards.length > 0) {
                            setYourTurn(true);
                        }
                        else {

                            if (gameCompletedOrderList.includes(name)) {
                                null
                            }
                            else {
                                let message = { "roomId": roomId, "type": "completionMessage", "message": `${name} finished the game` }
                                ws.send(JSON.stringify(message));
                                gameCompletedOrderList.push(name);
                            }

                            if (roomMembers.length === 4) {
                                if (roomMembers[3] !== name) {
                                    let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[yourPosition + 1], "turnMessage": `${roomMembers[yourPosition + 1]} is playing...` }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[0], "turnMessage": `${roomMembers[0]} is playing...` }
                                    ws.send(JSON.stringify(message));
                                }
                            }
                            if (roomMembers.length === 6) {
                                if (roomMembers[5] !== name) {
                                    let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[yourPosition + 1], "turnMessage": `${roomMembers[yourPosition + 1]} is playing...` }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[0], "turnMessage": `${roomMembers[0]} is playing...` }
                                    ws.send(JSON.stringify(message));
                                }

                            }
                            if (roomMembers.length === 8) {
                                if (roomMembers[7] !== name) {
                                    let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[yourPosition + 1], "turnMessage": `${roomMembers[yourPosition + 1]} is playing...` }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Next Turn", "nextPerson": roomMembers[0], "turnMessage": `${roomMembers[0]} is playing...` }
                                    ws.send(JSON.stringify(message));
                                }
                            }
                        }
                    }
                    setTurnMessage(resp.turnMessage);
                    setResponseForTheCard('');
                    setFromPerson('');
                    setToPerson('');
                    setCardAsked('');
                }

                if (resp.type === "Asking Partner Cards" && resp.fromPerson === partner && resp.toPerson === name) {
                    let message = { "roomId": roomId, "type": "Asking Partner Cards Response", "fromPerson": name, "toPerson": partner, "cards": cards }
                    ws.send(JSON.stringify(message));
                }

                if (resp.type === "Asking Partner Cards Response" && resp.fromPerson === partner && resp.toPerson === name) {
                    partnerCards = resp.cards;
                }

                if (resp.type === "Removing Cards From Partner" && resp.fromPerson === partner && resp.toPerson === name) {
                    if (resp.baseCaptured === "minorSpades") {
                        const resultArray = removeElementsFromArray(cards, minorSpades);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "majorSpades") {
                        const resultArray = removeElementsFromArray(cards, majorSpades);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "minorClubs") {
                        const resultArray = removeElementsFromArray(cards, minorClubs);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "majorClubs") {
                        const resultArray = removeElementsFromArray(cards, majorClubs);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "minorDiamonds") {
                        const resultArray = removeElementsFromArray(cards, minorDiamonds);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "majorDiamonds") {
                        const resultArray = removeElementsFromArray(cards, majorDiamonds);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "minorHearts") {
                        const resultArray = removeElementsFromArray(cards, minorHearts);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                    if (resp.baseCaptured === "majorHearts") {
                        const resultArray = removeElementsFromArray(cards, majorHearts);
                        cards = resultArray;
                        setYourCards(resultArray);
                    }
                }

                if (resp.type === "Base Captured Message") {
                    let messageString = `${resp.fromPerson} captured ${resp.baseCaptured}`
                    pointsMessage.push(messageString)
                    Snackbar.show({
                        text: messageString,
                        duration: Snackbar.LENGTH_LONG
                    });
                    totalPoints = totalPoints + 1;

                    if (totalPoints === 8) {
                        let checkArray = [];
                        pointsMessage.map((item) => {
                            let splited = item.split(" captured");
                            checkArray.push(splited[0])
                        })
                        const playerPoints = createKeyValuePairs(checkArray);
                        let message = { "roomId": roomId, "type": "Game Over", "result": playerPoints }
                        ws.send(JSON.stringify(message));
                    }
                }

                if (resp.type === "Card Added To The Round") {
                    console.log(resp);
                    onGoingSuitOfTheRound = resp.suit;
                    roundOrder.push(resp.fromPerson);
                    cardDeliveredInOrder.push(resp.card);
                    if (roundOrder.includes(resp.nextPerson)) {
                        if (gameSelected === "Ace") {
                            let largestCard = findLargestCard(cardDeliveredInOrder);
                            largestCard = `${largestCard} of ${onGoingSuitOfTheRound}`;
                            let index = cardDeliveredInOrder.indexOf(largestCard);
                            let personToStartNextRound = roundOrder[index];
                            setTurnMessage('');
                            setTimeout(() => {
                                onGoingSuitOfTheRound = '';
                                roundOrder = [];
                                cardDeliveredInOrder = [];
                            }, 3000)
                            setTimeout(() => {
                                Snackbar.show({
                                    text: "Round Completed",
                                    duration: Snackbar.LENGTH_LONG
                                });
                                if (personToStartNextRound === name) {
                                    let message = { "roomId": roomId, "type": "NextRound", "turnMessage": `${personToStartNextRound} is playing...`, "startPerson": personToStartNextRound }
                                    ws.send(JSON.stringify(message));
                                }
                            }, 4000)
                        }
                        if (gameSelected === "JackAndFive") {
                            let roundWinningCard = JackAndFiveRoundWinningCardCheckFunction(cardDeliveredInOrder, onGoingSuitOfTheRound);
                            let index = cardDeliveredInOrder.indexOf(roundWinningCard);
                            let personToStartNextRound = roundOrder[index];
                            if (yourPosition > 1) {
                                let messageString = `${name} and ${partner}`
                                pointsMessage.push(messageString)
                                cardDeliveredInOrder.map((item) => {
                                    let checkString = item.split(' of ')
                                    checkString = checkString[0];
                                    if (checkString[0] === "Jack") {
                                        jackandfiveCaptureList.push(`jack captured by ${messageString}`)
                                    }
                                    if (checkString[0] === "5") {
                                        jackandfiveCaptureList.push(`five captured by ${messageString}`)
                                    }
                                })
                            }
                            else {
                                let messageString = `${partner} and ${name}`
                                pointsMessage.push(messageString)
                                cardDeliveredInOrder.map((item) => {
                                    let checkString = item.split(' of ')
                                    checkString = checkString[0];
                                    if (checkString[0] === "Jack") {
                                        jackandfiveCaptureList.push(`jack captured by ${messageString}`)
                                    }
                                    if (checkString[0] === "5") {
                                        jackandfiveCaptureList.push(`five captured by ${messageString}`)
                                    }
                                })
                            }
                            setTurnMessage('');
                            setTimeout(() => {
                                onGoingSuitOfTheRound = '';
                                roundOrder = [];
                                cardDeliveredInOrder = [];
                            }, 3000)
                            setTimeout(() => {
                                Snackbar.show({
                                    text: "Round Completed",
                                    duration: Snackbar.LENGTH_LONG
                                });
                                if (personToStartNextRound === name) {
                                    let message = { "roomId": roomId, "type": "NextRound", "turnMessage": `${personToStartNextRound} is playing...`, "startPerson": personToStartNextRound }
                                    ws.send(JSON.stringify(message));
                                }
                            }, 4000)
                        }
                    }
                    else {
                        if (resp.nextPerson === name) {
                            if (cards.length > 0) {
                                setYourTurn(true);
                            }
                            else {
                                if (gameCompletedOrderList.includes(name)) {
                                    null
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "completionMessage", "message": `${name} finished the game` }
                                    ws.send(JSON.stringify(message));
                                    gameCompletedOrderList.push(name);
                                    if (gameSelected === "Ace") {
                                        if ((roomMembers.length - gameCompletedOrderList.length === 1)) {
                                            let message = { "roomId": roomId, "type": "Game Over", "result": gameCompletedOrderList }
                                            ws.send(JSON.stringify(message));
                                        }
                                    }
                                    if (gameSelected === "JackAndFive") {
                                        if ((roomMembers.length - gameCompletedOrderList.length === 0)) {
                                            const playerPoints = createKeyValuePairs(pointsMessage);
                                            let message = { "roomId": roomId, "type": "Game Over", "result": playerPoints }
                                            ws.send(JSON.stringify(message));
                                        }
                                    }
                                }
                                let lastIndex = (roomMembers.length - 1);
                                if (name === roomMembers[lastIndex]) {
                                    let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                    ws.send(JSON.stringify(message));
                                }
                            }
                        }
                        setTurnMessage(resp.turnMessage);
                    }
                }

                if (resp.type === "Round Cutted") {
                    console.log(resp);
                    if (gameSelected === "Ace") {
                        Snackbar.show({
                            text: `Round Cutted by ${resp.fromPerson} with ${resp.card}`,
                            duration: Snackbar.LENGTH_LONG
                        });
                        let largestCard = findLargestCard(cardDeliveredInOrder);
                        largestCard = `${largestCard} of ${onGoingSuitOfTheRound}`;
                        let index = cardDeliveredInOrder.indexOf(largestCard);
                        let personToStartNextRound = roundOrder[index];
                        cardDeliveredInOrder.push(resp.card);
                        if (personToStartNextRound === name) {
                            let message = { "roomId": roomId, "type": "NextRoundDueToCutting", "turnMessage": `${personToStartNextRound} is playing...`, "startPerson": personToStartNextRound, "cardsToBeAddedInHisList": cardDeliveredInOrder }
                            ws.send(JSON.stringify(message));
                        }
                        onGoingSuitOfTheRound = '';
                        roundOrder = [];
                        cardDeliveredInOrder = [];
                    }
                    if (gameSelected === "JackAndFive") {
                        roundOrder.push(resp.fromPerson);
                        cardDeliveredInOrder.push(resp.card);
                        if (roundOrder.includes(resp.nextPerson)) {
                            let roundWinningCard = JackAndFiveRoundWinningCardCheckFunction(cardDeliveredInOrder, onGoingSuitOfTheRound);
                            let index = cardDeliveredInOrder.indexOf(roundWinningCard);
                            let personToStartNextRound = roundOrder[index];
                            if (yourPosition > 1) {
                                let messageString = `${name} and ${partner}`
                                pointsMessage.push(messageString)
                                cardDeliveredInOrder.map((item) => {
                                    let checkString = item.split(' of ')
                                    checkString = checkString[0];
                                    if (checkString[0] === "Jack") {
                                        jackandfiveCaptureList.push(`jack captured by ${messageString}`)
                                    }
                                    if (checkString[0] === "5") {
                                        jackandfiveCaptureList.push(`five captured by ${messageString}`)
                                    }
                                })
                            }
                            else {
                                let messageString = `${partner} and ${name}`
                                pointsMessage.push(messageString)
                                cardDeliveredInOrder.map((item) => {
                                    let checkString = item.split(' of ')
                                    checkString = checkString[0];
                                    if (checkString[0] === "Jack") {

                                    }
                                    if (checkString[0] === "5") {

                                    }
                                })
                            }
                            setTurnMessage('');
                            setTimeout(() => {
                                onGoingSuitOfTheRound = '';
                                roundOrder = [];
                                cardDeliveredInOrder = [];
                            }, 3000)
                            setTimeout(() => {
                                Snackbar.show({
                                    text: "Round Completed",
                                    duration: Snackbar.LENGTH_LONG
                                });
                                if (personToStartNextRound === name) {
                                    let message = { "roomId": roomId, "type": "NextRound", "turnMessage": `${personToStartNextRound} is playing...`, "startPerson": personToStartNextRound }
                                    ws.send(JSON.stringify(message));
                                }
                            }, 4000)
                        }
                        else {
                            if (resp.nextPerson === name) {
                                if (cards.length > 0) {
                                    setYourTurn(true);
                                }
                                else {
                                    if (gameCompletedOrderList.includes(name)) {
                                        null
                                    }
                                    else {
                                        let message = { "roomId": roomId, "type": "completionMessage", "message": `${name} finished the game` }
                                        ws.send(JSON.stringify(message));
                                        gameCompletedOrderList.push(name);
                                        if ((roomMembers.length - gameCompletedOrderList.length === 0)) {
                                            const playerPoints = createKeyValuePairs(pointsMessage);
                                            let message = { "roomId": roomId, "type": "Game Over", "result": playerPoints }
                                            ws.send(JSON.stringify(message));
                                        }
                                    }
                                    let lastIndex = (roomMembers.length - 1);
                                    if (name === roomMembers[lastIndex]) {
                                        let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                        ws.send(JSON.stringify(message));
                                    }
                                    else {
                                        let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                        ws.send(JSON.stringify(message));
                                    }
                                }
                            }
                            setTurnMessage(resp.turnMessage);
                        }
                    }
                }

                if (resp.type === "NextRound" || resp.type === "NextRoundDueToCutting") {
                    console.log(resp);
                    if (resp.type === "NextRoundDueToCutting" && resp.startPerson === name) {
                        let newArray = cards.concat(resp.cardsToBeAddedInHisList);
                        setYourCards(newArray);
                        cards = newArray;
                    }
                    if (resp.startPerson === name) {
                        if (cards.length > 0) {
                            setYourTurn(true);
                        }
                        else {
                            if (gameCompletedOrderList.includes(name)) {
                                null
                            }
                            else {
                                let message = { "roomId": roomId, "type": "completionMessage", "message": `${name} finished the game` }
                                ws.send(JSON.stringify(message));
                                gameCompletedOrderList.push(name);
                                if (gameSelected === "Ace") {
                                    if ((roomMembers.length - gameCompletedOrderList.length) === 1) {
                                        let message = { "roomId": roomId, "type": "Game Over", "result": gameCompletedOrderList }
                                        ws.send(JSON.stringify(message));
                                    }
                                }
                                if (gameSelected === "JackAndFive") {
                                    if ((roomMembers.length - gameCompletedOrderList.length) === 0) {
                                        const playerPoints = createKeyValuePairs(pointsMessage);
                                        let message = { "roomId": roomId, "type": "Game Over", "result": playerPoints }
                                        ws.send(JSON.stringify(message));
                                    }
                                }
                            }
                            let lastIndex = (roomMembers.length - 1);
                            if (name === roomMembers[lastIndex]) {
                                let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                ws.send(JSON.stringify(message));
                            }
                        }
                    }
                    setTurnMessage(resp.turnMessage);
                }

                if (resp.type === "NoTurnDueToNoCards") {
                    console.log(resp);
                    if (resp.nextPerson === name) {
                        if (cards.length > 0) {
                            setYourTurn(true);
                        }
                        else {
                            if (gameCompletedOrderList.includes(name)) {
                                null
                            }
                            else {
                                let message = { "roomId": roomId, "type": "completionMessage", "message": `${name} finished the game` }
                                ws.send(JSON.stringify(message));
                                gameCompletedOrderList.push(name);
                                if (gameSelected === "Ace") {
                                    if ((roomMembers.length - gameCompletedOrderList.length) === 1) {
                                        let message = { "roomId": roomId, "type": "Game Over", "result": gameCompletedOrderList }
                                        ws.send(JSON.stringify(message));
                                    }
                                }
                                if (gameSelected === "JackAndFive") {
                                    if ((roomMembers.length - gameCompletedOrderList.length) === 0) {
                                        const playerPoints = createKeyValuePairs(pointsMessage);
                                        let message = { "roomId": roomId, "type": "Game Over", "result": playerPoints }
                                        ws.send(JSON.stringify(message));
                                    }
                                }
                            }
                            let lastIndex = (roomMembers.length - 1);
                            if (name === roomMembers[lastIndex]) {
                                let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "NoTurnDueToNoCards", "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                ws.send(JSON.stringify(message));
                            }
                        }
                    }
                    setTurnMessage(resp.turnMessage);
                }

                if (resp.type === "completionMessage") {
                    Snackbar.show({
                        text: resp.message,
                        duration: Snackbar.LENGTH_LONG
                    });
                }

                if (resp.type === "Game Over") {
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
                    if (gameSelected === "JackAndFive") {
                        jackCapturedByTeam1 = 0;
                        fiveCapturedByTeam1 = 0;
                        jackCapturedByTeam2 = 0;
                        fiveCapturedByTeam2 = 0;
                        jackandfiveCaptureList.map((item) => {
                            let splitted = item.split(' captured by ');
                            if (splitted[0] === "jack" && splitted[1] === `${roomMembers[0]} and ${roomMembers[2]}`) {
                                jackCapturedByTeam1 = jackCapturedByTeam1 + 10;
                            }
                            if (splitted[0] === "five" && splitted[1] === `${roomMembers[0]} and ${roomMembers[2]}`) {
                                fiveCapturedByTeam1 = fiveCapturedByTeam1 + 5;
                            }
                            if (splitted[0] === "jack" && splitted[1] === `${roomMembers[1]} and ${roomMembers[3]}`) {
                                jackCapturedByTeam2 = jackCapturedByTeam2 + 10;
                            }
                            if (splitted[0] === "five" && splitted[1] === `${roomMembers[1]} and ${roomMembers[3]}`) {
                                fiveCapturedByTeam2 = fiveCapturedByTeam2 + 5;
                            }
                        })
                        resp.result.map((item) => {
                            if (item.player === `${roomMembers[0]} and ${roomMembers[2]}`) {
                                let player = item.player
                                let points = item.points + jackCapturedByTeam1 - fiveCapturedByTeam1
                                endResultOfJackAndFive.push({ player: player, points: points })
                            }
                            if (item.player === `${roomMembers[1]} and ${roomMembers[3]}`) {
                                let player = item.player
                                let points = item.points + jackCapturedByTeam2 - fiveCapturedByTeam2
                                endResultOfJackAndFive.push({ player: player, points: points })
                            }
                        })
                    }
                    setAskedCardSuit('');
                    setAskedCardRank('');
                    setResponseForTheCard('');
                    setCardAsked('');
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
                    endResult = ((gameSelected === "JackAndFive") ? endResultOfJackAndFive : resp.result)
                    setEndGameScreen(true);
                }

                if (resp.type === "delete" || resp.type === "Game Started" || resp.type === "Asking Card" || resp.type === "Asked Card Response" || resp.type === "Next Turn" || resp.type === "Base Captured Message" || resp.type === "Game Over" || resp.type === "Asking Partner Cards Response" || resp.type === "Asking Partner Cards" || resp.type === "Removing Cards From Partner" || resp.type === "Fetching GameName Response" || resp.type === "Fetching GameName" || resp.type === "completionMessage" || resp.type === "NoTurnDueToNoCards" || resp.type === "NextRound" || resp.type === "NextRoundDueToCutting" || resp.type === "Round Cutted" || resp.type === "Card Added To The Round") {
                    null
                }
                else {
                    console.log(resp);
                    fetchParticipants(resp.roomId);
                    if (resp.type === "leave" && resp.sender === name) {
                        null
                    }
                    else {
                        Snackbar.show({
                            text: `${resp.notifyMessage}`,
                            duration: Snackbar.LENGTH_LONG
                        })
                    }
                }
            }
        };

    }, []);

    const handleLogout = () => {
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
        gameSelected = ''
    };

    const fetchParticipants = async (id) => {
        await axios.get(`http://13.71.92.130:5000/get-participants/${id}`)
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
            const response = await axios.post('http://13.71.92.130:5000/create-room');
            if (response.data.roomId) {
                roomId = response.data.roomId;
                setMessage(`RoomId : ${response.data.roomId}`);
                try {
                    name = "host"
                    if (roomId !== '') {
                        const resp = await axios.post('http://13.71.92.130:5000/join-room', { roomId, name })
                        if (resp.status === 200) {
                            setCreateRoom(true);
                        }
                    }
                }
                catch (error) {
                    Snackbar.show({
                        text: `Error in joining the room for creater : ${error}`,
                        duration: Snackbar.LENGTH_LONG
                    })
                }
            }
        } catch (error) {
            Snackbar.show({
                text: 'Room Creation not successful',
                duration: Snackbar.LENGTH_LONG
            })
        }
    };

    const joinRoomServer = async () => {
        const namepattern = /^[A-Za-z0-9_]{3,12}$/;

        if (roomId === '') {
            Snackbar.show({
                text: 'You cannot join without roomId',
                duration: Snackbar.LENGTH_LONG
            })
        }

        else if (roomId !== '') {
            const response = await axios.get(`http://13.71.92.130:5000/get-participants/${roomId}`);
            if (response.data) {
                let members = response.data
                if (name === '') {
                    Snackbar.show({
                        text: 'You cannot join with empty name',
                        duration: Snackbar.LENGTH_LONG
                    })
                }
                else if (name === "host") {
                    Snackbar.show({
                        text: 'Dont use host as your name',
                        duration: Snackbar.LENGTH_LONG
                    })
                    name = '';
                }
                else if (members.includes(name)) {
                    Snackbar.show({
                        text: 'Name Already Taken',
                        duration: Snackbar.LENGTH_LONG
                    })
                    name = '';
                }
                else if (!namepattern.test(name)) {
                    Snackbar.show({
                        text: 'Name can be between 3 to 12 characters without any special symbols and emojis and can accept _',
                        duration: Snackbar.LENGTH_LONG
                    })
                    name = '';
                }
                else if (members.length >= 7) {
                    Snackbar.show({
                        text: 'This room is full. Maximum of 8 players only can play this game.',
                        duration: Snackbar.LENGTH_LONG
                    })
                    roomId = '';
                    name = '';
                }
                else {
                    try {
                        const response = await axios.post('http://13.71.92.130:5000/join-room', { roomId, name });
                        if (response.status === 200) {
                            setJoinedRoom(true);
                            setMessage('Joined room successfully');
                            let message = { "roomId": roomId, "type": "Fetching GameName", "toPerson": "host" }
                            ws.send(JSON.stringify(message));
                        }
                    } catch (error) {
                        roomId = ''
                        Snackbar.show({
                            text: `Error in joining the room : ${error}`,
                            duration: Snackbar.LENGTH_LONG
                        })
                    }
                }
            }
        }
    };

    const leaveRoomServer = async () => {
        try {
            type = "leave"
            const response = await axios.post('http://13.71.92.130:5000/leave-room', { roomId, name, type });
            if (response.status === 200) {
                setJoinRoom(false);
                setJoinedRoom(false);
                roomId = '';
                setEnteredRoomId('');
                setEnteredName('');
                name = ''
                setMessage('');
                setActiveGameTab(null);
                gameSelected = '';
            }
        } catch (error) {
            Snackbar.show({
                text: `Error leaving the room: ${error}`,
                duration: Snackbar.LENGTH_LONG
            });
        }
    };

    const kickPlayer = async () => {
        if (playerToBeKicked === '') {
            Snackbar.show({
                text: 'Please enter the player name you want to kick',
                duration: Snackbar.LENGTH_LONG
            });
        }
        else if (playerToBeKicked === 'host') {
            Snackbar.show({
                text: 'You are the host! you cannot kick yourself. If you want to delete this room choose delete room option',
                duration: Snackbar.LENGTH_LONG
            });
            setPlayerToBeKicked('');
        }
        else if (participants.includes(playerToBeKicked)) {
            try {
                let name = playerToBeKicked
                type = "kick"
                const response = await axios.post('http://13.71.92.130:5000/leave-room', { roomId, name, type });
                if (response.status === 200) {
                    setPlayerToBeKicked('');
                    setModalVisible(!isModalVisible);
                }
            } catch (error) {
                setPlayerToBeKicked('');
                name = ''
                Snackbar.show({
                    text: `Error in kicking the player: ${error}`,
                    duration: Snackbar.LENGTH_LONG
                });
            }
        }
        else {
            Snackbar.show({
                text: 'The player you have mentioned is not there in the room',
                duration: Snackbar.LENGTH_LONG
            });
        }
    };

    const deleteRoom = async () => {
        try {
            const response = await axios.delete(`http://13.71.92.130:5000/delete-room/${roomId}`)
            setActiveGameTab(null);
            gameSelected = '';
        }
        catch (error) {
            Snackbar.show({
                text: `Error in deleting the room: ${error}`,
                duration: Snackbar.LENGTH_LONG
            });
        }
    };

    const playGame = async () => {
        if (gameSelected === "Memory" && roomMembers.length < 4) {
            Snackbar.show({
                text: 'Need atleast 4 players to play the game',
                duration: Snackbar.LENGTH_LONG
            });
        }
        else if (gameSelected === "Memory" && (roomMembers.length === 5 || roomMembers.length === 7)) {
            Snackbar.show({
                text: 'Need even number of players to play the game',
                duration: Snackbar.LENGTH_LONG
            });
        }
        else if (gameSelected === "Ace" && roomMembers.length < 2) {
            Snackbar.show({
                text: 'Need atleast 2 players to play the game',
                duration: Snackbar.LENGTH_LONG
            });
        }
        else if (gameSelected === "JackAndFive" && roomMembers.length !== 4) {
            Snackbar.show({
                text: 'Need exactly 4 players to play the game',
                duration: Snackbar.LENGTH_LONG
            });
        }
        else {

            function createDeck() {
                const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
                const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
                const deck = [];

                for (const suit of suits) {
                    for (const value of values) {
                        if (gameSelected === "Memory") {
                            if (value !== '8') {
                                deck.push(`${value} of ${suit}`);
                            }
                        }
                        else {
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
                const players = Array.from({ length: numPlayers }, () => []);
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
            name = 'host'

            // Sending cards to each players
            for (let i = 0; i < numPlayers; i++) {
                let message = { "roomId": roomId, "type": "Game Started", "cardsOf": roomMembers[i], "cards": players[i].join(', '), "turnMessage": "host is playing..." }
                ws.send(JSON.stringify(message));
            }

        }
    };

    function showParticipants() {
        return (
            <>
                <Text style={[styles.members, { marginTop: -25, marginBottom: 0 }]}>
                    Players
                </Text>
                {participants.map((members, index) => {
                    return (
                        <Text key={index} style={styles.participants}>{members}</Text>
                    )
                })}
            </>
        )
    };

    const checkCard = () => {

        if (gameSelected === "Memory") {
            if (activeMemberTab === null || activeRankTab === null || activeSuitTab === null) {
                Snackbar.show({
                    text: 'Please choose suit, rank and member',
                    duration: Snackbar.LENGTH_LONG
                });
            }
        }
        else {
            if (activeSuitTab === null || activeRankTab === null) {
                Snackbar.show({
                    text: 'Please choose suit and rank',
                    duration: Snackbar.LENGTH_LONG
                });
            }
        }

        let suitString = (activeSuitTab === "Spade") ? "Spades" : (activeSuitTab === "Club") ? "Clubs" : (activeSuitTab === "Diamond") ? "Diamonds" : (activeSuitTab === "Heart") ? "Hearts" : null;
        let rankString = (activeRankTab === "A") ? "Ace" : (activeRankTab === "J") ? "Jack" : (activeRankTab === "Q") ? "Queen" : (activeRankTab === "K") ? "King" : activeRankTab;
        let checkString = `${rankString} of ${suitString}`;

        if (gameSelected === "Memory" && activeMemberTab !== null && activeRankTab !== null && activeSuitTab !== null) {
            let groupCheck = '';
            if (minorSpades.includes(checkString)) {
                groupCheck = 'minorSpades'
            }
            else if (majorSpades.includes(checkString)) {
                groupCheck = 'majorSpades'
            }
            else if (minorClubs.includes(checkString)) {
                groupCheck = 'minorClubs'
            }
            else if (majorClubs.includes(checkString)) {
                groupCheck = 'majorClubs'
            }
            else if (minorDiamonds.includes(checkString)) {
                groupCheck = 'minorDiamonds'
            }
            else if (majorDiamonds.includes(checkString)) {
                groupCheck = 'majorDiamonds'
            }
            else if (minorHearts.includes(checkString)) {
                groupCheck = 'minorHearts'
            }
            else if (majorHearts.includes(checkString)) {
                groupCheck = 'majorHearts'
            }
            else {
                null
            }

            let canAsk = false;
            if (groupCheck === 'minorSpades') {
                for (const card of yourCards) {
                    if (minorSpades.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'majorSpades') {
                for (const card of yourCards) {
                    if (majorSpades.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'minorClubs') {
                for (const card of yourCards) {
                    if (minorClubs.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'majorClubs') {
                for (const card of yourCards) {
                    if (majorClubs.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'minorDiamonds') {
                for (const card of yourCards) {
                    if (minorDiamonds.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'majorDiamonds') {
                for (const card of yourCards) {
                    if (majorDiamonds.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'minorHearts') {
                for (const card of yourCards) {
                    if (minorHearts.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else if (groupCheck === 'majorHearts') {
                for (const card of yourCards) {
                    if (majorHearts.includes(card)) {
                        canAsk = true;
                        break;
                    }
                }
            }
            else {
                null
            }

            if (canAsk === true) {
                let message = { "roomId": roomId, "type": "Asking Card", "fromPerson": name, "toPerson": activeMemberTab, "card": checkString }
                ws.send(JSON.stringify(message));
                canAsk = false;
            }
            else {
                Snackbar.show({
                    text: 'You cannot ask this card since base card is not there with you',
                    duration: Snackbar.LENGTH_LONG
                });
            }
        }

        if ((gameSelected === "Ace" || gameSelected === "JackAndFive") && activeSuitTab !== null && activeRankTab !== null) {
            let canPut = false;
            let canCut = true;
            if (yourCards.includes(checkString)) {
                canPut = true;
            }
            if (canPut === true) {
                let lastIndex = (roomMembers.length - 1);
                if (onGoingSuitOfTheRound === '') {
                    if (name === roomMembers[lastIndex]) {
                        let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                        ws.send(JSON.stringify(message));
                    }
                    else {
                        let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                        ws.send(JSON.stringify(message));
                    }
                    const newArray = cards.filter(item => item !== checkString);
                    setYourCards(newArray);
                    cards = newArray;
                    canPut = false;
                    setYourTurn(false);
                }
                if (onGoingSuitOfTheRound !== '') {

                    if (onGoingSuitOfTheRound === "Spades") {
                        if (suitString === onGoingSuitOfTheRound) {
                            if (name === roomMembers[lastIndex]) {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                ws.send(JSON.stringify(message));
                            }
                            const newArray = cards.filter(item => item !== checkString);
                            setYourCards(newArray);
                            cards = newArray;
                            canPut = false;
                            setYourTurn(false);
                        }
                        else {
                            for (const card of yourCards) {
                                if (spadesList.includes(card)) {
                                    canCut = false;
                                    Snackbar.show({
                                        text: 'You cannot cut this round , Since you have spades',
                                        duration: Snackbar.LENGTH_LONG
                                    });
                                    break;
                                }
                            }
                            if (canCut === true) {
                                if (name === roomMembers[lastIndex]) {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                    ws.send(JSON.stringify(message));
                                }
                                const newArray = cards.filter(item => item !== checkString);
                                setYourCards(newArray);
                                cards = newArray;
                                setYourTurn(false);
                            }
                        }
                    }
                    if (onGoingSuitOfTheRound === "Clubs") {
                        if (suitString === onGoingSuitOfTheRound) {
                            if (name === roomMembers[lastIndex]) {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                ws.send(JSON.stringify(message));
                            }
                            const newArray = cards.filter(item => item !== checkString);
                            setYourCards(newArray);
                            cards = newArray;
                            canPut = false;
                            setYourTurn(false);
                        }
                        else {
                            for (const card of yourCards) {
                                if (clubsList.includes(card)) {
                                    canCut = false;
                                    Snackbar.show({
                                        text: 'You cannot cut this round , Since you have clubs',
                                        duration: Snackbar.LENGTH_LONG
                                    });
                                    break;
                                }
                            }
                            if (canCut === true) {
                                if (name === roomMembers[lastIndex]) {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                    ws.send(JSON.stringify(message));
                                }
                                const newArray = cards.filter(item => item !== checkString);
                                setYourCards(newArray);
                                cards = newArray;
                                setYourTurn(false);
                            }
                        }
                    }
                    if (onGoingSuitOfTheRound === "Diamonds") {
                        if (suitString === onGoingSuitOfTheRound) {
                            if (name === roomMembers[lastIndex]) {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                ws.send(JSON.stringify(message));
                            }
                            const newArray = cards.filter(item => item !== checkString);
                            setYourCards(newArray);
                            cards = newArray;
                            canPut = false;
                            setYourTurn(false);
                        }
                        else {
                            for (const card of yourCards) {
                                if (diamondsList.includes(card)) {
                                    canCut = false;
                                    Snackbar.show({
                                        text: 'You cannot cut this round , Since you have diamonds',
                                        duration: Snackbar.LENGTH_LONG
                                    });
                                    break;
                                }
                            }
                            if (canCut === true) {
                                if (name === roomMembers[lastIndex]) {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                    ws.send(JSON.stringify(message));
                                }
                                const newArray = cards.filter(item => item !== checkString);
                                setYourCards(newArray);
                                cards = newArray;
                                setYourTurn(false);
                            }
                        }
                    }
                    if (onGoingSuitOfTheRound === "Hearts") {
                        if (suitString === onGoingSuitOfTheRound) {
                            if (name === roomMembers[lastIndex]) {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                let message = { "roomId": roomId, "type": "Card Added To The Round", "fromPerson": name, "card": checkString, "suit": suitString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
                                ws.send(JSON.stringify(message));
                            }
                            const newArray = cards.filter(item => item !== checkString);
                            setYourCards(newArray);
                            cards = newArray;
                            canPut = false;
                            setYourTurn(false);
                        }
                        else {
                            for (const card of yourCards) {
                                if (heartsList.includes(card)) {
                                    canCut = false;
                                    Snackbar.show({
                                        text: 'You cannot cut this round , Since you have hearts',
                                        duration: Snackbar.LENGTH_LONG
                                    });
                                    break;
                                }
                            }
                            if (canCut === true) {
                                if (name === roomMembers[lastIndex]) {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[0]} is playing...`, "nextPerson": roomMembers[0] }
                                    ws.send(JSON.stringify(message));
                                }
                                else {
                                    let message = { "roomId": roomId, "type": "Round Cutted", "fromPerson": name, "card": checkString, "turnMessage": `${roomMembers[yourPosition + 1]} is playing...`, "nextPerson": roomMembers[yourPosition + 1] }
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
            }
            else {
                Snackbar.show({
                    text: 'You cannot put this card since this card is not with you',
                    duration: Snackbar.LENGTH_LONG
                });
            }
        }

    };

    const createRoomConfirmation = () => {
        if (activeGameTab === null) {
            Snackbar.show({
                text: 'Select The game',
                duration: Snackbar.LENGTH_LONG
            });
        }
        else {
            setGameSelectionScreen(false);
            createRoomServer();
        }
    };

    return (
        <SafeAreaView style={[styles.flex, { backgroundColor: theme.backgroundColor }]}>
            {!createRoom && !joinRoom && !gameScreen && !endGameScreen && !gameSelectionScreen &&
                < View style={styles.container1}>
                    <View style={styles.roomContainer1}>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>How To Play ?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleLogout}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.roomContainer2}>
                        <TouchableOpacity style={styles.button} onPress={() => { setGameSelectionScreen(true) }}>
                            <Text style={styles.buttonText}>Create Room</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => { setJoinRoom(true) }}>
                            <Text style={styles.buttonText}>Join Room</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            {gameSelectionScreen &&
                <Modal isVisible={gameSelectionScreen} animationIn="slideInUp" animationOut="slideOutDown" style={styles.roomContainer5}>
                    <View style={styles.modalContainer3}>
                        <Text style={styles.modalText}>Select the Game You Want to Play in this Room</Text>
                        <View style={{ flexDirection: 'row', width: "70%", height: 25, marginTop: 20 }}>
                            {gamesList.map((item) => {
                                return (
                                    <GameSelectionTab key={item} label={item} isActive={activeGameTab === item} onPress={() => { setActiveGameTab(item); gameSelected = item }} />
                                )
                            })
                            }
                        </View>
                        <View style={styles.roomContainer2}>
                            <TouchableOpacity style={styles.button} onPress={() => { setGameSelectionScreen(false); setActiveGameTab(null); gameSelected = '' }}>
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={createRoomConfirmation}>
                                <Text style={styles.buttonText}>Ok</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            }
            {createRoom && !gameScreen && !endGameScreen &&
                <>
                    <View style={styles.container2}>
                        <View style={styles.roomContainer3}>
                            {showParticipants()}
                        </View>
                        <View style={[styles.container1]}>
                            <Text style={[styles.message, { marginBottom: -30 }]}>{message}</Text>
                            <Text style={[styles.message, { marginBottom: 0 }]}>{`Game:${activeGameTab}`}</Text>
                            <View style={[styles.roomContainer4, { bottom: -20 }]}>
                                <TouchableOpacity style={styles.button} onPress={playGame}>
                                    <Text style={styles.buttonText}>
                                        Play
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button}
                                    onPress={deleteRoom}
                                >
                                    <Text style={styles.buttonText}>
                                        Delete Room
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={toggleKickPlayerDialogModal}>
                                    <Text style={styles.buttonText}>
                                        Kick Player
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Modal isVisible={isModalVisible} animationIn="slideInUp" animationOut="slideOutDown" style={styles.roomContainer5}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalText}>Enter The Player Name You Want To Kick</Text>
                            <TextInput
                                placeholder="Enter Player Name"
                                value={playerToBeKicked}
                                placeholderTextColor={'#AEAEAE'}
                                onChangeText={text => { setPlayerToBeKicked(text) }}
                                style={styles.input}
                            />
                            <View style={styles.roomContainer4}>
                                <TouchableOpacity style={styles.button} onPress={kickPlayer}>
                                    <Text style={styles.buttonText}>kick</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={toggleKickPlayerDialogModal}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                </>
            }
            {joinRoom && !joinedRoom && !gameScreen && !endGameScreen &&
                <View style={styles.container1}>
                    <View>
                        <TextInput
                            placeholder="Enter Room ID"
                            value={enteredRoomId}
                            placeholderTextColor={'#AEAEAE'}
                            onChangeText={text => { setEnteredRoomId(text); roomId = text }}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Create a name for you"
                            value={enteredName}
                            placeholderTextColor={'#AEAEAE'}
                            onChangeText={text => { setEnteredName(text); name = text }}
                            style={styles.input}
                        />
                        <View style={[styles.roomContainer4, styles.left]}>
                            <TouchableOpacity style={styles.button} onPress={joinRoomServer}>
                                <Text style={styles.buttonText}>
                                    Join
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => { setJoinRoom(false); setEnteredRoomId(''); setEnteredName(''); name = ''; roomId = '' }}>
                                <Text style={styles.buttonText}>
                                    back
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
            {joinRoom && joinedRoom && !gameScreen && !endGameScreen &&
                <View style={styles.container2}>
                    <View style={styles.roomContainer3}>
                        {showParticipants()}
                    </View>
                    <View style={styles.container1}>
                        <Text style={[styles.message, { marginBottom: -30 }]}>{message}</Text>
                        <Text style={[styles.message, { marginBottom: 0 }]}>{`Game:${activeGameTab}`}</Text>
                        <TouchableOpacity style={[styles.button, { bottom: -20 }]} onPress={leaveRoomServer}>
                            <Text style={styles.buttonText}>
                                Leave Room
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
            {gameScreen && !endGameScreen &&
                <View style={styles.flex}>
                    <View style={styles.container4}>

                        <View style={styles.roomContainer7}>
                            <Text style={styles.turnText}>
                                {turnMessage !== '' ? turnMessage : null}
                            </Text>
                            {fromPerson !== '' && toPerson !== '' && askedCardRank !== '' && askedCardSuit !== '' && gameSelected === "Memory" &&
                                <View style={styles.roomContainer8}>
                                    <Text style={[styles.turnText, styles.roomContainer8Spacing]}>
                                        {fromPerson}
                                    </Text>
                                    <Icon style={styles.roomContainer8Spacing} name="forward" color={"#FF6700"} />
                                    <Card rank={askedCardRank} suit={askedCardSuit} bigCard={true} />
                                    <Icon style={styles.roomContainer8Spacing} name="forward" color={"#FF6700"} />
                                    <Text style={styles.turnText}>
                                        {toPerson}
                                    </Text>
                                </View>
                            }
                            {responseForTheCard !== '' && gameSelected === "Memory" &&
                                <Text style={styles.turnText}>
                                    {responseForTheCard === "correct" ? `Correct Guess! . ${fromPerson} will continue.. ` : responseForTheCard === "wrong" ? `Worng Guess` : null}
                                </Text>
                            }
                            {(gameSelected === "Ace" || gameSelected === "JackAndFive") && cardDeliveredInOrder.length > 0 && roundOrder.length > 0 &&
                                <>
                                    <View style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Text style={styles.turnText}>
                                            Round Info
                                        </Text>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ display: 'flex', flexDirection: 'row' }}>
                                        {cardDeliveredInOrder.map((item, index) => {
                                            let spliting = item.split("of");
                                            let rank = spliting[0];
                                            let suit = spliting[1];
                                            return (
                                                <Card key={index} rank={rank} suit={suit} person={roundOrder[index]} cardWithPerson={true} />
                                            )
                                        })}
                                    </ScrollView>
                                </>
                            }
                        </View>

                        {yourTurn &&
                            <Modal isVisible={yourTurn} animationIn="slideInUp" animationOut="slideOutDown" style={styles.roomContainer5}>
                                <ScrollView style={styles.scrollView}>
                                    <View style={styles.modalContainer2}>
                                        <Text style={[styles.modalText2, { textAlign: 'center' }]}>{gameSelected === "Memory" ? "Select the Suit, Rank and the Player you want to ask the card" : "Select the Suit, and Rank of the card you are willing to put"}</Text>
                                        <View style={styles.subRoomContainer1}>
                                            <Text style={styles.modalText3}>
                                                Select the Suit
                                            </Text>
                                            <View style={{ flexDirection: 'row', width: "60%", height: 25 }}>
                                                {globalSuit.map((item) => {
                                                    return (
                                                        <CardAndMemberSelectionTab key={item} label={item} isActive={activeSuitTab === item} onPress={() => handleSuitTabPress(item)} />
                                                    )
                                                })
                                                }
                                            </View>
                                        </View>
                                        <View style={styles.subRoomContainer1}>
                                            <Text style={styles.modalText3}>
                                                Select the Rank
                                            </Text>
                                            <View style={{ flexDirection: 'row', width: gameSelected === "Memory" ? "70%" : "58%", height: 25 }}>
                                                {gameSelected === "Memory" ? globalRankInMemoryGame.map((item) => {
                                                    return (
                                                        <CardAndMemberSelectionTab key={item} label={item} isActive={activeRankTab === item} onPress={() => handleRankTabPress(item)} />
                                                    )
                                                }) :
                                                    globalRank.map((item) => {
                                                        return (
                                                            <CardAndMemberSelectionTab key={item} label={item} isActive={activeRankTab === item} onPress={() => handleRankTabPress(item)} />
                                                        )
                                                    })
                                                }
                                            </View>
                                        </View>
                                        {gameSelected === "Memory" &&
                                            <View style={styles.subRoomContainer1}>
                                                <Text style={styles.modalText3}>
                                                    Select the Player
                                                </Text>
                                                <View style={{ flexDirection: 'row', width: "80%", height: 25 }}>
                                                    {membersYouCanAsk.map((item) => {
                                                        return (
                                                            <CardAndMemberSelectionTab key={item} label={item} isActive={activeMemberTab === item} onPress={() => handleMemberTabPress(item)} name={true} />
                                                        )
                                                    })
                                                    }
                                                </View>
                                            </View>
                                        }
                                        <View style={[styles.roomContainer4, { marginTop: 10 }]}>
                                            <TouchableOpacity style={styles.button} onPress={checkCard}>
                                                <Text style={styles.buttonText}>Ok</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.button} onPress={() => { setViewCardsScreen(true); setYourTurn(false) }}>
                                                <Text style={styles.buttonText}>View Cards</Text>
                                            </TouchableOpacity>
                                            {(gameSelected === "Ace" || gameSelected === "JackAndFive") && cardDeliveredInOrder.length > 0 && roundOrder.length > 0 &&
                                                <TouchableOpacity style={styles.button} onPress={() => { setRoundInfoScreen(true); setYourTurn(false) }}>
                                                    <Text style={styles.buttonText}>Round Info</Text>
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    </View>
                                </ScrollView>
                            </Modal>
                        }
                        {viewCardsScreen &&
                            <Modal isVisible={viewCardsScreen} animationIn="slideInUp" animationOut="slideOutDown" style={styles.roomContainer5}>
                                <View style={styles.modalContainer4}>
                                    <Text style={styles.modalText2}>Your Cards</Text>
                                    <FlatList
                                        data={yourCards}
                                        renderItem={({ item }) => {
                                            let spliting = item.split("of");
                                            let rank = spliting[0];
                                            let suit = spliting[1];
                                            return <Card key={item} rank={rank} suit={suit} />
                                        }}
                                        keyExtractor={item => item}
                                        horizontal={true}
                                        showsHorizontalScrollIndicator={false}
                                    />
                                    <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => { setViewCardsScreen(false); setYourTurn(true) }}>
                                        <Text style={styles.buttonText}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </Modal>
                        }
                        {roundInfoScreen &&
                            <Modal isVisible={roundInfoScreen} animationIn="slideInUp" animationOut="slideOutDown" style={styles.roomContainer5}>
                                <View style={styles.modalContainer4}>
                                    <Text style={styles.modalText2}>Round Info</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ display: 'flex', flexDirection: 'row' }}>
                                        {cardDeliveredInOrder.map((item, index) => {
                                            let spliting = item.split("of");
                                            let rank = spliting[0];
                                            let suit = spliting[1];
                                            return (
                                                <Card key={index} rank={rank} suit={suit} person={roundOrder[index]} cardWithPerson={true} />
                                            )
                                        })}
                                    </ScrollView>
                                    <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => { setRoundInfoScreen(false); setYourTurn(true) }}>
                                        <Text style={styles.buttonText}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </Modal>
                        }
                    </View>
                    <View style={styles.container5}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

                            {yourCards.map((cardString, index) => {
                                let spliting = cardString.split("of");
                                let rank = spliting[0];
                                let suit = spliting[1];
                                return (
                                    <Card key={index} rank={rank} suit={suit} />
                                )
                            })}

                        </ScrollView>
                    </View>
                </View>
            }
            {endGameScreen &&
                <View style={styles.container6}>
                    {(gameSelected === "Memory" || gameSelected === "JackAndFive") &&
                        <View style={styles.roomContainer9}>
                            <View>
                                <Text style={[styles.turnText, styles.endScreenHeading]}>
                                    Player
                                </Text>
                                {endResult.map((item) => {
                                    return (
                                        <Text style={[styles.endScreenText, styles.endScreenHeading]}>
                                            {item.player}
                                        </Text>
                                    )
                                })
                                }
                            </View>
                            <View>
                                <Text style={[styles.turnText, styles.endScreenHeading]}>
                                    Points
                                </Text>
                                {endResult.map((item) => {
                                    return (
                                        <Text style={[styles.endScreenText, styles.endScreenHeading]}>
                                            {item.points}
                                        </Text>
                                    )
                                })
                                }
                            </View>
                        </View>
                    }
                    {gameSelected === "Ace" &&
                        <View >
                            <Text style={[styles.turnText, styles.endScreenHeading]}>
                                Winning Order
                            </Text>
                            {endResult.map((item) => {
                                return (
                                    <Text style={[styles.endScreenText, styles.endScreenHeading]}>
                                        {item}
                                    </Text>
                                )
                            })
                            }
                        </View>
                    }

                    <TouchableOpacity style={styles.button} onPress={handleExit}>
                        <Text style={styles.buttonText}>Exit</Text>
                    </TouchableOpacity>
                </View>
            }
        </SafeAreaView >
    )
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
        columnGap: 20
    },
    container2: {
        flex: 1,
        alignItems: 'center',
    },
    roomContainer3: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        top: 30
    },
    members: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#5dbea3",
        marginBottom: 5,
    },
    participants: {
        color: '#80669d',
        marginBottom: 3,
        fontWeight: "bold"
    },
    message: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#5dbea3",
        marginBottom: 20
    },
    roomContainer4: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 20
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
        left: 20
    },
    button: {
        backgroundColor: '#80669d',
        borderRadius: 10,
        height: 40
    },
    buttonText: {
        color: '#5dbea3',
        fontSize: 16,
        fontWeight: 'bold',
        padding: 8,
        alignSelf: "center"
    },
    roomContainer5: {
        alignItems: "center",
        justifyContent: "center",
        display: 'flex'
    },
    modalContainer: {
        backgroundColor: '#5dbea3',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        width: "40%",
    },
    modalText: {
        fontWeight: 'bold',
        color: '#80669d',
        marginBottom: 10
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
        marginRight: 5
    },
    cardTextRed: {
        color: "#FF0000",
        fontWeight: "600"
    },
    cardTextBlack: {
        color: "#000000",
        fontWeight: "600"
    },
    roomContainer7: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 10
    },
    turnText: {
        fontWeight: "600",
        color: '#FF6700'
    },
    modalContainer2: {
        flex: 1,
        backgroundColor: '#5dbea3',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        width: "100%",
        height: '100%'
    },
    modalText2: {
        fontWeight: '900',
        color: '#783937',
        fontSize: 20,
        marginBottom: 10
    },
    modalText3: {
        fontWeight: 'bold',
        color: '#80669d',
        marginBottom: 5,
        marginTop: 5
    },
    subRoomContainer1: {
        display: 'flex',
        flexDirection: 'column',
        columnGap: 5,
        justifyContent: 'center',
        alignItems: "center"
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
        fontWeight: 'bold'
    },
    modalContainer3: {
        backgroundColor: '#5dbea3',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        width: "100%",
    },
    modalContainer4: {
        backgroundColor: '#5dbea3',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        width: "100%",
    },
    roomContainer8: {
        display: 'flex',
        flexDirection: 'row',
        rowGap: 20,
        alignItems: 'center'
    },
    roomContainer8Spacing: {
        marginRight: 20
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
        marginRight: 20
    },
    container6: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    roomContainer9: {
        display: 'flex',
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20
    },
    endScreenHeading: {
        marginBottom: 8
    },
    endScreenText: {
        color: "#5dbea3"
    },
    scrollView: {
        maxHeight: '100%',
    }
})