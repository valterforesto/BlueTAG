// (c) 2016 Valter Foresto

var listItem;
var advMAC;
var advItem;
var advTimer;
var now;
var a;
var b;
var status;
var edd_scheme;
var edd_url;

//-----------------------------------------------------------------
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

//-----------------------------------------------------------------
function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 1 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

//----------------------------------------------------------------
function advScanFunc() {
  ble.stopScan();
  status = "advScanFunc()";
  ble.startScan([], app.onAdvDevice, app.onError);
  advTimer = setTimeout(advScanFunc, 600); 
}

function disconnectDevice(){
  ble.disconnect(advMAC, null, app.onError);
}
    
var app = {
  initialize: function() {
    console.log("initialize()");
    scanPage.hidden = true;
    servicePage.hidden = true;
    generalConfigPage.hidden = true;
    accessControlPage.hidden = true;
    configurationPage.hidden = true;
    eddystonePage.hidden = true;
    this.bindEvents();
  },

  bindEvents: function() {
    console.log("bindEvents()");
    document.addEventListener('deviceready', this.onDeviceReady, false);
    openURL.addEventListener('touchend', this.tappedImage, false);
    eddystoneButton.addEventListener('touchend', this.eddystonePage, false);
    configurationPageButton.addEventListener('touchend', this.configurationPage, false);
    accessControlButton.addEventListener('touchend', this.accessControlPage, false);
    generalConfigButton.addEventListener('touchend', this.generalConfigPage, false);
    exit5Button.addEventListener('touchend', this.servicePage, false);
    exit4Button.addEventListener('touchend', this.servicePage, false);
    exit3Button.addEventListener('touchend', this.servicePage, false);
    exit2Button.addEventListener('touchend', this.servicePage, false);
    exitButton.addEventListener('touchend', this.disconnect, false);
    scanRescanButton.addEventListener('touchend', this.refreshDeviceList, false);
    scanDeviceList.addEventListener('touchend', this.tappedList, false);
  },
  
  onDeviceReady: function() {
    console.log("onDeviceReady()");
    app.refreshDeviceList();
  },

	generalConfigPage: function() {
    console.log("general config()");
    scanPage.hidden = true;
    servicePage.hidden = true;
    generalConfigPage.hidden = false;
    accessControlPage.hidden = true;
    eddystonePage.hidden = true;
    configurationPage.hidden = true;
    Read_General_Config_Param();
  },
	
	servicePage: function() {
    console.log("service()");
    scanPage.hidden = true;
    servicePage.hidden = false;
    generalConfigPage.hidden = true;
    accessControlPage.hidden = true;
    eddystonePage.hidden = true;
    configurationPage.hidden = true;
    Read_Access_Entry();
    document.getElementById("PSW").value = "";    
  },
	
	eddystonePage: function() {
    console.log("eddystone()");
    scanPage.hidden = true;
    servicePage.hidden = true;
    generalConfigPage.hidden = true;
    accessControlPage.hidden = true;
    eddystonePage.hidden = false;
    configurationPage.hidden = true;
    Read_Eddystone_Param();
  },
  
  configurationPage: function() {
    console.log("configuration()");
    scanPage.hidden = true;
    servicePage.hidden = true;
    generalConfigPage.hidden = true;
    accessControlPage.hidden = true;
    eddystonePage.hidden = true;
    configurationPage.hidden = false;
    Read_Configuration_Param();
  },
	
	accessControlPage: function() {
    console.log("access control()");
    scanPage.hidden = true;
    servicePage.hidden = true;
    generalConfigPage.hidden = true;
    accessControlPage.hidden = false;
    eddystonePage.hidden = true;
    configurationPage.hidden = true;
    Read_Access_Control_Param();
  },
	
	tappedImage: function() {
    console.log("tappedImage()");
    var ref = window.open('http://www.iblio.net', '_blank', 'location=yes');
  },
	
    //======================================================================================
  onError: function(reason) {
    console.log("onError() - " + status);
    alert("ERROR: " + status  + reason); // real apps should use notification.alert
  },
	
	onDone: function(reason) {
    console.log("onDone() - " + status);
    // alert("DONE: " + status + reason); // real apps should use notification.alert
  },
    
    //======================================================================================
  refreshDeviceList: function() {
    status = "refreshDeviceList()";    
    console.log(status);
    scanPage.hidden = false;
    servicePage.hidden = true;
	  generalConfigPage.hidden = true;
	  accessControlPage.hidden = true;
	  eddystonePage.hidden = true;
    configurationPage.hidden = true;
    scanDeviceList.innerHTML = '';
	  document.getElementById('msg').innerHTML = '';
    document.getElementById('batteryLevel').innerHTML = '';
    document.getElementById('ledOn').innerHTML = '';
    //clearInterval(advTimer);
    //ble.stopScan(app.onDone, app.onError); //insert from ADV return
    ble.scan([], 16, app.onDiscoverDevice, app.onError);
  },

  onDiscoverDevice: function(device) {
    console.log("onDiscoverDevice()");
    console.log(JSON.stringify(device));
    listItem = document.createElement('li'),
    html = '<b>' + device.name + '</b><br/>' +
    'RSSI: ' + device.rssi + '&nbsp;&nbsp;[' + device.id + ']';
    listItem.dataset.deviceId = device.id;
    listItem.innerHTML = html;
    scanDeviceList.appendChild(listItem);
  },

    //======================================================================================
  tappedList: function(e) {
    console.log("tappedList()");
    document.getElementById('msg').innerHTML = '';
    document.getElementById('ledOn').innerHTML = '';
    document.getElementById('batteryLevel').innerHTML = '';
    advMAC = e.target.dataset.deviceId;
    console.log(advMAC);
    if(advMAC == null) {
      document.getElementById('msg').innerHTML = '<p><b>Please (re)Tap the Device on the List</b></p>';
    } else
    app.connect();
  },

    //======================================================================================
  connect: function() {
    status = "connect()";
    console.log(status);
    ble.stopScan(app.onDone, app.onError);
    onConnect = function() {
      console.log("Connected...");
      var value = document.getElementById("accessSelection").value;
      console.log (value);
      if(value == 0) {
        document.getElementById('ledOn').innerHTML = '<p><b>LED TAG is Flashing !!</b></p>';
        Set_Led_On();
        setTimeout(app.refreshDeviceList, 8000);  
      } else if(value == 1) {
        document.getElementById('ledOn').innerHTML = '<p><b>LED TAG is Flashing !!</b></p>';
        Set_Led_Url();
        setTimeout(app.refreshDeviceList, 12000);  
      } else if(value == 2) {
        read_Battery_Level();
        setTimeout(app.refreshDeviceList, 8000);  
      } else {
        scanPage.hidden = true;
        servicePage.hidden = false;
        generalConfigPage.hidden = true;
        accessControlPage.hidden = true;
        configurationPage.hidden = true;
        eddystonePage.hidden = true;
      }
    };
    ble.connect(advMAC, onConnect, app.onDisconnection);
  },
    
  onDisconnection: function(e) {
    console.log("onDisconnection()");
    alert ("Connection Lost ... Rescan");
    app.refreshDeviceList();
  },

  disconnect: function(e) {
    status = "disconnect()";
    console.log(status);
    ble.disconnect(advMAC, app.refreshDeviceList, app.onError); 
  }

};

var access = {
  service:      "EE0C0000-8786-40BA-AB96-99B91AC981D8",
  pswentry:     "EE0C0001-8786-40BA-AB96-99B91AC981D8",
  accctrl:      "EE0C0002-8786-40BA-AB96-99B91AC981D8",
  accpwd:       "EE0C0003-8786-40BA-AB96-99B91AC981D8",
  accpowon:     "EE0C0004-8786-40BA-AB96-99B91AC981D8",
	accreset:     "EE0C0005-8786-40BA-AB96-99B91AC981D8",
};

var seque = {
  service:      "EE0C0040-8786-40BA-AB96-99B91AC981D8",
  period:       "EE0C0041-8786-40BA-AB96-99B91AC981D8",
  seque:        "EE0C0042-8786-40BA-AB96-99B91AC981D8",
  cntrl:        "EE0C0043-8786-40BA-AB96-99B91AC981D8",
};
	
var general = {
  service:      "EE0C0100-8786-40BA-AB96-99B91AC981D8",
  level:        "EE0C0101-8786-40BA-AB96-99B91AC981D8",
  rssi:         "EE0C0102-8786-40BA-AB96-99B91AC981D8",
  advch:        "EE0C0103-8786-40BA-AB96-99B91AC981D8",
};

var eddystone = {
  service:      "EE0C4100-8786-40BA-AB96-99B91AC981D8",
  scheme:       "EE0C4101-8786-40BA-AB96-99B91AC981D8",
  url:          "EE0C4102-8786-40BA-AB96-99B91AC981D8",
};

var hardware = {
  service:      "EE0C9900-8786-40BA-AB96-99B91AC981D8",
  ledActTime:   "EE0C9902-8786-40BA-AB96-99B91AC981D8",
  productCode:  "EE0C9903-8786-40BA-AB96-99B91AC981D8",
};

var freeAccess = {
  service:      "00000000-8786-40BA-AB96-99B91AC981D8",
  ledActivation:"00000001-8786-40BA-AB96-99B91AC981D8",
  batteryLevel: "00000002-8786-40BA-AB96-99B91AC981D8",
};	
	
function Set_PSW() {
  status = "Set_PSW()";
  console.log(status);
  var value = document.getElementById("PSW").value;
  console.log (value);  
  if (value.length != 8) {
    alert("ERROR PASSWORD must be 8 chars");
    return;
  }
  var val = str2ab(value);
  console.log (val);
  ble.write(advMAC, access.service, access.pswentry, val, onPwdok, app.onDisc);
}
function onPwdok(reason) {
  alert("ACCESS ENABLED !!");
}

function Set_ADV_period() {				
  status = "Set_ADV_period()";
  console.log(status);
  var value = document.getElementById("ADV_period").value;
  var val = new Uint8Array(1);
  val[0] = value;
  console.log (val.buffer);  
  ble.write(advMAC, seque.service, seque.period, val.buffer, app.onDone, app.onError);
}

function Set_SCAN_Req() {
  status = "Set_SCAN_Req()";
  console.log(status);
  var value = document.getElementById("SCAN_Req").value;
  var val = new Uint8Array(1);
  val[0] = value;
  console.log (val.buffer);  
  ble.write(advMAC, seque.service, seque.cntrl, val.buffer, app.onDone, app.onError);
}

function Set_TX_lev() {
  status = "Set_TX_lev()";
  console.log(status);
  var value = document.getElementById("Tx_lev").value;
  var val = new Int16Array(1);
  val[0] = value;
  console.log(val.buffer);
  var valueDec = document.getElementById("Tx_lev_decimals").value;
  var valdec = new Int16Array(1);
  valdec[0] = valueDec;
  console.log(valdec.buffer);
  var txLev = new Int16Array(1);
  txLev[0] = (val[0] * 10) + valdec[0];
  console.log(txLev.buffer);
  ble.write(advMAC, general.service, general.level, txLev.buffer, app.onDone, app.onError);
}

function Set_ADV_ch() {
  status = "Set_ADV_ch()";
  console.log(status);
  var value = document.getElementById("ADV_ch").value;
  var val = new Uint8Array(1);
  val[0] = value;
  console.log(val.buffer);
  ble.write(advMAC, access.service, access.accctrl, val.buffer, app.onDone, app.onError);
}

function Set_password() {
  status = "Set_password()";
  console.log(status);
  var value = document.getElementById("access_password").value;
  console.log (value);
  if (value.length != 8) {
    alert("ERROR Password must be 8 chars"); return;
  }
  var val = str2ab(value);
  console.log (val);
  ble.write(advMAC, access.service, access.accpwd, val, app.onDone, app.onError);
}

function Set_access_at_poweron() {
  status = "Set_access_at_poweron()";
  console.log(status);
  var value = document.getElementById("access_power_on").value;
  var val = new Uint8Array(1);
  val[0] = value;
  console.log (val.buffer);  
  ble.write(advMAC, access.service, access.accpowon, val.buffer, app.onDone, app.onError);
}

function Set_factory_default() {
  status = "Set_factory_default()";
  console.log(status);
  var val = new Uint8Array(1);
  val[0] = 0xFF;
  console.log(val.buffer);
  ble.write(advMAC, access.service, access.accreset, val.buffer, onReset, onDisc);
}
function onDisc(reason) {
  console.log("onDisc()");
  app.refreshDeviceList();
}
function onReset(reason) {
  console.log("onReset()");
}	

function Set_schema() {
  status = "Set_schema()";  
  console.log(status);
  var value = document.getElementById("Schema").value;
  var val = new Uint8Array(1);
  val[0] = value;
  console.log (val.buffer);  
  ble.write(advMAC, eddystone.service, eddystone.scheme, val.buffer, app.onDone, app.onError);
}

function Set_URL() {
  status = "Set_URL()";  
  console.log(status);
  var value = document.getElementById("URL").value;
  console.log (value);
  if ((value.length < 4) || (value.length > 16)) {
    alert("ERROR URL must be 4 to 16 chars"); return;
  }
  var val = str2ab(value);
  console.log (val);
  ble.write(advMAC, eddystone.service, eddystone.url, val, app.onDone, app.onError);
} 

function Set_Led_On() {
  status = "Set_Led_On()";  
  console.log(status);
  var val = new Uint8Array(1);
  val[0] = 0xFF;
  console.log(val.buffer);
  ble.write(advMAC, freeAccess.service, freeAccess.ledActivation, val.buffer, disconnectDevice, app.onError);
}

function Set_Led_Url() {
  status = "Set_Led_Url()";  
  console.log(status);
  var val = new Uint8Array(1);
  val[0] = 0xFF; //LED on
  console.log(val.buffer);
  ble.write(advMAC, freeAccess.service, freeAccess.ledActivation, val.buffer, Read_Scheme, app.onError);
}
function Read_Scheme() {			
  status = "Read_Scheme()";	
  console.log(status);
  ble.read(advMAC, eddystone.service, eddystone.scheme, sub_Scheme, app.onError);
}
function sub_Scheme(val) {
  console.log(val);
  var x = new DataView(val, 0); 
  var y = x.getUint8(0);
  console.log(y);
  if (y == 0) {
    edd_scheme = "http://www.";
  } else if (y == 1) {
    edd_scheme = "https://www.";
  } else if (y == 2) {
    edd_scheme = "http://";
  } else if (y == 3) {
    edd_scheme = "https://";
  }
  console.log(edd_scheme);
  Read_URL();
}
function Read_URL() {			
  status = "Read_URL()";	
  console.log(status);
  ble.read(advMAC, eddystone.service, eddystone.url, sub_URL , app.onError);
}
function sub_URL(val) {
  console.log(val);
  var s1 = ab2str(val);
  console.log(s1);
  edd_url = s1;
  console.log(edd_url);
  Read_Product_Code();
}
function Read_Product_Code() {			
  status = "Read_Product_Code()";	
  console.log(status);
  ble.read(advMAC, hardware.service, hardware.productCode, sub_PCode, app.onError);
}
function sub_PCode(val) {
  console.log(val);
  var s1 = ab2str(val);
  console.log(s1);
  pcode = s1;
  console.log(edd_scheme + edd_url + "?p=" + pcode);
  window.open(edd_scheme + edd_url + "?p=" + pcode, '_blank', 'location=yes');
  disconnectDevice();
}

function Set_Led_Time() {
  status = "Set_Led_Time()";  
  console.log(status);
  var value = document.getElementById("timeLedOn").value;
  var val = new Uint8Array(1);
  val[0] = value;
  console.log (val.buffer); 
  ble.write(advMAC, hardware.service, hardware.ledActTime, val.buffer, app.onDone, app.onError);
}

function Set_Product_Code() {
  status = "Set_Product_Code()";  
  console.log(status);
  var value = document.getElementById("product_Code").value;
  console.log (value);
  if ((value.legth < 3) || (value.length > 16)) {
    alert("ERROR Product Code must be 3 to 16 chars"); return;
  }
  var val = str2ab(value);
  console.log (val);
  ble.write(advMAC, hardware.service, hardware.productCode, val, app.onDone, app.onError);
}

function Read_General_Config_Param() {
	console.log("Read_General_Config_Param()");
	Read_ADV_period();
//	Read_Sequencer();
//	Read_Scan_Request();
	Read_Tx_Level();
	Read_RSSI();
	Read_ADV_Channel();
}

function Read_Access_Control_Param() {
	console.log("Read_Access_Control_Param()");
	Read_Access_Control();
  Read_Access_Passord();
	Read_Access_Power_On();
}

function Read_Eddystone_Param() {			
	console.log("Read_Eddystone_Param()");
	Read_Scheme_Only();
	Read_URL_Only();
}	

function Read_Configuration_Param() {			
	console.log("Read_Configuration_Param()");
	Read_Time_Led_On();
	Read_Product_Code_Only();
}	

function read_Battery_Level() {
  status = "read_Battery_Level()";
  console.log(status);
  ble.read(advMAC, freeAccess.service, freeAccess.batteryLevel, UpdateUI_Battery_Level, app.onDone, app.onError);
}
function UpdateUI_Battery_Level(val) {
  console.log(val);
  var x = new DataView(val, 0);
  document.getElementById('batteryLevel').innerHTML = '<p><b>Battery Level is &nbsp;' + x.getUint16(0, true) + '&nbsp; mV</b></p>';
}

function Read_Time_Led_On() {			
  status = "Read_Time_Led_On()";	
  console.log(status);
  ble.read(advMAC, hardware.service, hardware.ledActTime, UpdateUI_Time_Led_On, app.onError);
}
function UpdateUI_Time_Led_On(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("timeLedOn").value = x.getInt8(0);
}

function Read_Access_Entry() {
  status = "Read_Access_Entry()";
  console.log(status);
  ble.read(advMAC, seque.service, seque.period, UpdateUI_Access_Entry, app.onError);
}
function UpdateUI_Access_Entry(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("xxxxxxx").value = x.getInt8(0);
}

function Read_Access_Control() {			
  status = "Read_Access_Control()";
  console.log(status);
  ble.read(advMAC, access.service, access.accctrl, UpdateUI_Access_Control, app.onError);
}
function UpdateUI_Access_Control(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("access_control").value = x.getInt8(0);
}		

function Read_Access_Passord() {						
  status = "Read_Access_Password()";	
  console.log(status);
  ble.read(advMAC, access.service, access.accpwd, UpdateUI_Access_Password, app.onError);
}
function UpdateUI_Access_Password(val) {
  console.log(val);
  var s1 = ab2str(val);
  console.log(s1);
  document.getElementById("access_password").value = s1;
}		

function Read_Access_Power_On() {			
	status = "Read_Access_Power_On()";
	console.log(status);
	ble.read(advMAC, access.service, access.accpowon, UpdateUI_Access_Power_On, app.onError);
}
function UpdateUI_Access_Power_On(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("access_power_on").value = x.getInt8(0);
}	

function Read_ADV_period() {			
  status = "Read_ADV_period()";	
  console.log(status);
  ble.read(advMAC, seque.service, seque.period, UpdateUI_ADV_period, app.onError);
}
function UpdateUI_ADV_period(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("ADV_period").value = x.getInt8(0);
}

function Read_Scan_Request() {			
  status = "Read_Scan_Request()";	
  console.log(status);
  ble.read(advMAC, seque.service, seque.cntrl, UpdateUI_Scan_Request, app.onError);
}
function UpdateUI_Scan_Request(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("SCAN_Req").value = x.getInt8(0);
}

function Read_Tx_Level() {			
  status = "Read_Tx_Level()";	
  console.log(status);
  ble.read(advMAC, general.service, general.level, UpdateUI_Tx_Level, app.onError);
}
function UpdateUI_Tx_Level(val) {
  console.log(val);
  var x = new DataView(val, 0);
  var y = x.getInt16(0, true);
  console.log(Math.floor(y / 10));
  var Dec;
//  var negDec;
  if ((y % 10) >= 0) {
    Dec = y % 10
  } else if ((y % 10) < 0) {
    Dec = ( 10 + (y % 10))
  }
  console.log(y % 10);
  document.getElementById("Tx_lev").value = Math.floor(y / 10);
  document.getElementById("Tx_lev_decimals").value = Dec;
  }

function Read_RSSI() {
  status = "Read_RSSI()";  
  console.log(status);
  ble.read(advMAC, general.service, general.rssi, UpdateUI_Read_RSSI, app.onError);
}
function UpdateUI_Read_RSSI(val) {
  console.log(val);
  var v0 = new DataView(val);
  var d = v0.getInt8(0);
  console.log(d);
  document.getElementById("RSSI").value = d;
}

function Read_ADV_Channel() {			
  status = "Read_ADV_Channel()";	
  console.log(status);
  ble.read(advMAC, general.service, general.advch, UpdateUI_ADV_Channel, app.onError);
}
function UpdateUI_ADV_Channel(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("ADV_ch").value = x.getInt8(0);
}

function Read_Product_Code_Only() {			
  status = "Read_Product_Code()";	
  console.log(status);
  ble.read(advMAC, hardware.service, hardware.productCode, UpdateUI_Read_Product_Code, app.onError);
}
function UpdateUI_Read_Product_Code(val) {
  console.log(val);
  var s1 = ab2str(val);
  console.log(s1);
  document.getElementById("product_Code").value = s1;
}

function Read_URL_Only() {			
  status = "Read_URL_Only()";	
  console.log(status);
  ble.read(advMAC, eddystone.service, eddystone.url, UpdateUI_Read_URL , app.onError);
}
function UpdateUI_Read_URL(val) {
  console.log(val);
  var s1 = ab2str(val);
  console.log(s1);
  document.getElementById("URL").value = s1;
}

function Read_Scheme_Only() {			
  status = "Read_Scheme_Only()";	
  console.log(status);
  ble.read(advMAC, eddystone.service, eddystone.scheme, UpdateUI_Scheme, app.onError);
}
function UpdateUI_Scheme(val) {
  console.log(val);
  var x = new DataView(val, 0);
  console.log(x.getInt8(0));
  document.getElementById("Schema").value = x.getInt8(0);
}
}
