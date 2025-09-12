import { StyleSheet, Dimensions, StatusBar } from "react-native";

export const semiTransparentGray = "rgba(229, 229, 229, 0.7)"; // 这里的0.5表示50%的透明度

export const metaStyles = StyleSheet.create({
  //flex
  parentContainer:{
   flex:1,
   backgroundColor: "#fff",
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  
  },
  varContainer:{
    flex:1,
  },
  verMarginContainer: {
    flex: 1,
    margin: 20,
  },
  rowContainer:{
    flexDirection:'row'
  },
  rowMarginContainer:{
    flexDirection:'row',
    margin: 20,
  },
  rowCenterContainer:{
    flexDirection:'row',
    alignItems:'center',
  
    
    
    // alignItems:'center',
    // justifyContent:'center'
  },


  //////
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  button: {
    width: 100,
    height: 50,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  //image
  tabImage: {
    width: 20,
    height: 20,
  },
  splaceImage: {
    width: 100,
    height: 100,
  },
  // text
  grayText99: {
    color: "#999999",
    fontSize: 14,
  },
  grayTextSmall66: {
    color: "#666666",
    fontSize: 14,
  },
  grayTextdefault66: {
    color: "#666666",
    fontSize: 16,
  },

  blueText: {
    color: "#171AFF",
    fontSize: 14,
  },
  themes: {
    color: "#FFDC51",
  },
  titleText: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "bold",
  },
  bigLargeDefaultText: {
    color: "#333333",
    fontSize: 30,
    fontWeight: "bold",
  },
  largeDefaultText: {
    color: "#333333",
    fontSize: 21,
    fontWeight: "bold",
    lineHeight: 30,
  },
  largeDefaultLittleText: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 30,
  },
  defaultText18: {
    color: "#333333",
    fontSize: 18,
  },
  defaultText: {
    color: "#333333",
    fontSize: 16,
    // lineHeight: 24,
  },
  smallDefaultText: {
    color: "#333333",
    fontSize: 14,
    lineHeight: 20,
  },
  smallGrayText: {
    color: "#999999",
  },
  //TextInputs

  textInputDefault: {
    marginTop: 10,
    borderRadius: 8,
    // backgroundColor:'#E5E5E5',
    backgroundColor: semiTransparentGray,
    // borderWidth:1,
    // borderColor:'#E5E5E5',
    // padding:10,
    fontSize: 14,
    color: "#333333",
    padding: 10,
    // textAlignVertical:'auto',
    alignItems:'center',
    alignContent:'center',
    justifyContent:'center'
  },
  textInputBorderLine: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor:'#ffffff',
    // backgroundColor: semiTransparentGray,
    borderWidth:1,
    borderColor:"#171AFF",
    // padding:10,
    fontSize: 14,
    color: "#333333",
    padding: 10,
    // textAlignVertical: "top",
  },

  //notice red
  noticeRed: {
    borderRadius: 8,
    // backgroundColor:'#E5E5E5',
    backgroundColor: '#FDF6F6',
    // borderWidth:1,
    // borderColor:'#E5E5E5',
    // padding:10,
    fontSize: 14,
    // color: "#FA5151",
    textAlignVertical: "top",
    marginTop:20,
    paddingHorizontal:10,
    paddingVertical:15
  },

  //listview item
  flatListStyle: {
    width: "100%",
    backgroundColor: "#F5F7F9",
    marginTop: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginHorizontal:20, 
    marginVertical:20,
  },

  //bg
  lineBgRadius: {
    borderColor:'rgba(191, 194, 204, 0.5)',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
  },
 
});

export const themeColor = "#FFDC51";
export const inputNormalBgColor = 'rgba(191, 194, 204, 0.5)';
export const litterWhittleBgColor = '#F5F7F9';
export const grayNormalColor = '#909399';
export const normalColor = '#303133';
export let showPayCode = 1;  //1:real 0:sim

export function setShowPayCode(code: number) {
  showPayCode = code;
}