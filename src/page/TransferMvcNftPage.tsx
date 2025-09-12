import {
  View,
  Text,
  Image,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LoadingModal,
  LoadingNoticeModal,
  RoundSimButton,
  RoundSimButtonFlee,
  TitleBar,
  VerifyModal,
} from "../constant/Widget";
import { getShowImageUrl } from "../utils/MetaFunUiils";
import { metaStyles, themeColor } from "../constant/Constants";
import { navigate } from "../base/NavigationService";
import { useData } from "../hooks/MyProvider";
import { API_NET, API_TARGET, NftManager } from "meta-contract";
import { MvcGenesisItemBean } from "@/bean/MvcGenesisBean";
import { getWalletNetwork, goToWebScan, isObserverWalletMode } from "@/utils/WalletUtils";

export default function TransferMvcNftPage({ route }) {
  const { myObject } = route.params;
  // const mm:MvcGenesisItemBean;
  // let imgNftUrl = getShowImageUrl(myObject.nftIcon!);
  let imgNftUrl = getShowImageUrl(myObject.icon!);
  const { loadingModal, setLoadingDailog } = useData();
  const [confirmDailogState, setConfirmDailogState] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [transferSuccedDailogState, setTransferSuccedDailogState] =
    useState(false);

  // verfiy
  const [isShowVerify, setIsShowVerify] = useState(false);
  const [rawTx, setrawTx] = useState("");

  const [noticeContent, setNoticeContent] = useState("Successful");
  const [isShowNotice, setIsShowNotice] = useState(false);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const { metaletWallet, updateMetaletWallet } = useData();

  const [transactionID, settransactionID] = useState("");
  const sendNft = async () => {
    setIsShowLoading(true);
    const network = await getWalletNetwork();
    
    const privateKey: string = metaletWallet.currentMvcWallet.getPrivateKey();
    const nftManager = new NftManager({
      // network: API_NET.MAIN,
      network:network === "mainnet" ? API_NET.MAIN : API_NET.TEST,
      apiTarget: API_TARGET.APIMVC,
      purse: privateKey,
    });
    const transferRes = await nftManager
      .transfer({
        // codehash: myObject.nftCodehash,
        // genesis: myObject.nftGenesis,
        // tokenIndex: myObject.nftTokenIndex,
        codehash: myObject.codeHash,
        genesis: myObject.genesis,
        tokenIndex: myObject.tokenIndex,
        senderWif: privateKey,
        receiverAddress: inputAddress,
      })
      .catch((e) => {
        console.log(e);
        setIsShowLoading(false);
        showNotice(e.message);
      });

    if (transferRes && transferRes.txid) {
      setIsShowLoading(false);
      settransactionID(transferRes.txid);
      setTransferSuccedDailogState(true);
      // setrawTx(transferRes.rawtx);
    }
  };

  function showNotice(notice: string) {
    setNoticeContent(notice);
    setIsShowNotice(true);
    setTimeout(() => {
      setIsShowNotice(false);
    }, 1500);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff", marginBottom: 20 }}
    >
      <TitleBar title="Transfers NFT" />
      <LoadingModal isCancel={true} isShow={isShowLoading} />
      <LoadingNoticeModal title={noticeContent} isShow={isShowNotice} />

      <Modal visible={confirmDailogState} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingTop: 30,
              marginHorizontal: 20,
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 16 }}>
              Confirm Transaction
            </Text>

            <View
              style={{
                marginTop: 20,
                alignItems: "center",
                borderColor: "rgba(191, 194, 204, 0.5)",
                flexDirection: "row",
                borderWidth: 1,
                height: 60,
                borderRadius: 10,
              }}
            >
              <Image
                source={{ uri: imgNftUrl }}
                style={{ width: 40, height: 40 }}
              />
              <View style={{}}>
                <Text style={{ fontSize: 14, marginLeft: 10 }}>
                  {/* {myObject.nftName} */}
                  {myObject.name}
                </Text>
                <Text style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}>
                  {/* # {myObject.nftTokenIndex} */}
                  # {myObject.tokenIndex}
                </Text>
              </View>
            </View>

            <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
              Recipient Address
            </Text>
            <Text
              numberOfLines={1}
              style={{ marginTop: 10, color: "#333", fontSize: 14 }}
            >
              {inputAddress}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              <RoundSimButtonFlee
                title={"Cancel"}
                style={{
                  borderRadius: 10,
                  height: 40,
                  width: "45%",
                  borderWidth: 1,
                  borderColor: themeColor,
                }}
                color="#fff"
                textColor="#171AFF"
                event={() => {
                  setConfirmDailogState(false);
                }}
              />

              <RoundSimButtonFlee
                title={"Confirm"}
                style={{ borderRadius: 10, height: 40, width: "45%" }}
                textColor="#fff"
                event={() => {
                  setConfirmDailogState(false);
                  setIsShowVerify(true);
                  // sendNft();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={transferSuccedDailogState} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingTop: 30,
              marginHorizontal: 20,
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 16, color: themeColor }}
            >
              Sent Successfully
            </Text>

            <View
              style={{
                marginTop: 20,
                alignItems: "center",
                borderColor: "rgba(191, 194, 204, 0.5)",
                flexDirection: "row",
                borderWidth: 1,
                height: 60,
                borderRadius: 10,
              }}
            >
              <Image
                source={{ uri: imgNftUrl }}
                style={{ width: 40, height: 40 }}
              />
              <View style={{}}>
                <Text style={{ fontSize: 14, marginLeft: 10 }}>
                  {myObject.nftName}
                </Text>
                <Text style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}>
                  # {myObject.nftTokenIndex}
                </Text>
              </View>
            </View>

            <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
              Recipient Address
            </Text>
            <Text
              numberOfLines={1}
              style={{ marginTop: 10, color: "#333", fontSize: 14 }}
            >
              {inputAddress}
            </Text>

            <Text style={{ marginTop: 15, color: "#666", fontSize: 14 }}>
              Transaction ID
            </Text>

            <TouchableWithoutFeedback
              onPress={() => {
                goToWebScan("mvc", transactionID);
              }}
            >
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{ color: "#333", fontSize: 14, flex: 1 }}
                >
                  {transactionID}
                </Text>
                <Image
                  source={require("../../image/link_ins_icon.png")}
                  style={{ width: 15, height: 15, marginLeft: 2 }}
                />
              </View>
            </TouchableWithoutFeedback>

            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              {/* <RoundSimButtonFlee
                title={"Cancel"}
                style={{
                  borderRadius: 10,
                  height: 40,
                  width: "45%",
                  borderWidth: 1,
                  borderColor: themeColor,
                }}
                color="#fff"
                textColor="#171AFF"
                event={() => {
                  setConfirmDailogState(false);
                }}
              /> */}

              <RoundSimButtonFlee
                title={"OK"}
                style={{ borderRadius: 10, height: 45 }}
                textColor="#fff"
                event={() => {
                  setTransferSuccedDailogState(false);
                  navigate("HomePage");
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* pay verify modal */}
      <VerifyModal
        isShow={isShowVerify}
        eventCancel={() => {
          setIsShowVerify(false);
        }}
        event={async () => {
          setIsShowVerify(false);
          const isCold=await isObserverWalletMode();
          if(!isCold){
            sendNft();
          }
         
          // const { txid, message } = await broadcastSpace(rawTx);
          // if (txid != null) {
          //   updateNeedRefreshHome(getRandomID());
          //   navigate("SendSuccessPage", {
          //     result: {
          //       chain:"mvc",
          //       symbol:mvcFtData.symbol.toUpperCase(),
          //       txid: txid,
          //       amount: inputAmount,
          //       address: inputAddress,
          //     },
          //   });
          // }
        }}
      />

      <View style={metaStyles.verMarginContainer}>
        <View
          style={{
            alignItems: "center",
            borderColor: "rgba(191, 194, 204, 0.5)",
            flexDirection: "row",
            borderWidth: 1,
            height: 100,
            borderRadius: 10,
          }}
        >
          <Image
            source={{ uri: imgNftUrl }}
            style={{ width: 80, height: 80 }}
          />
          <View style={{}}>
            <Text style={{ fontSize: 14, marginLeft: 10 }}>
              {myObject.nftName}
            </Text>
            <Text style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}>
              # {myObject.nftTokenIndex}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignItems: "center",
            borderColor: "rgba(191, 194, 204, 0.5)",
            flexDirection: "row",
            borderWidth: 1,
            height: 50,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <TextInput
            multiline={true}
            placeholder="Recipient's address"
            onChangeText={(text) => {
              setInputAddress(text);
            }}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              marginLeft: 10,
            }}
          />
        </View>

        <View style={{ flex: 1 }} />

        <RoundSimButton
          title="Confirm"
          event={() => {
            //    navigate('HomePage')
            if (inputAddress) {
              setConfirmDailogState(true);
            } else {
              showNotice("Please enter the recipient's address");
            }
          }}
          textColor="#fff"
        />
      </View>
    </SafeAreaView>
  );
}
