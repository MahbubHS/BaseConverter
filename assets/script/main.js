const xelem = document.getElementById("x");
const sel1elem = document.getElementById("sel1");
const sel2elem = document.getElementById("sel2");
const yelem = document.getElementById("y");
const calgroup = document.getElementById("calgroup");
const cal1elem = document.getElementById("cal1");
const cal2elem = document.getElementById("cal2");
const convertBtn = document.getElementById("convertBtn");

window.addEventListener("DOMContentLoaded", function () {
  calgroup.style.display = "none";
  var params = GetURLParams();
  if (Object.keys(params).length > 0 && params.x != "") {
    xelem.value = params.x;
    sel1elem.value = params.sel1;
    sel2elem.value = params.sel2;
    onconvert();
  }
  toggleConvertButton();
});

function GetURLParams() {
  var url = window.location.href;
  var regex = /[?&]([^=#]+)=([^&#]*)/g,
    params = {},
    match;
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2];
  }
  return params;
}

function copy(event) {
  event.preventDefault(); // Prevent page refresh
  yelem.select();
  document.execCommand("copy");
  yelem.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(yelem.value);
}

function base2decimal(x, dec, b) {
  var txt = "(" + x + ")<sub>" + b.toString() + "</sub> = ";
  var d,
    e,
    minus = false;
  var len = x.length;
  if (x[0] == "-") {
    txt += "-[";
    x = x.substr(1);
    len--;
    minus = true;
  }
  var idot = x.indexOf(".");
  if (idot >= 0) {
    x = x.substring(0, idot) + x.substring(idot + 1, len);
    len--;
  } else idot = len;
  for (var i = 0; i < len; i++) {
    d = parseInt(x[i], b);
    e = idot - i - 1;
    e = e.toString();
    txt += "(" + d + " \u00D7 " + b + "<sup>" + e + "</sup>)";
    if (i < len - 1) txt += " + ";
  }
  if (minus) txt += "]";
  txt += " = (" + dec + ")<sub>10</sub>";
  document.getElementById("cal1txt").innerHTML = txt;
}

function digits_after_period(x) {
  f = x.toString();
  i = f.indexOf(".");
  len = f.length - i - 1;
  return len;
}

function decimal2base(dec, y, b) {
  var row,
    txt = "";
  //$("#cal2tbl tbody tr").remove();
  document
    .getElementById("cal2tbl")
    .getElementsByTagName("tbody")[0].innerHTML = "";
  if (dec < 0) dec = -dec;
  dec = dec.toString();
  var id = dec.indexOf(".");
  var nd = y.length - y.indexOf(".") - 1;
  if (nd > 6) nd = 6;
  if (id >= 0 && nd > 0) {
    txt =
      "Multiply the number with the destination base raised to the power of decimals of the result (up to 6 digits resolution):<br>";
    txt += "floor(" + dec + "&times;" + b + "<sup>" + nd + "</sup>) = ";
    dec = Math.floor(dec * Math.pow(b, nd));
    txt += dec;
  }
  document.getElementById("cal2dec").innerHTML = txt;
  for (let n = dec, k = 0; n >= 1; k++) {
    row = "<tr>";
    row += "<td>" + n + "/" + b + "</td>";
    row += "<td class='TDs'>" + Math.floor(n / b) + "</td>";
    row += "<td class='TDs'>" + (n % b).toFixed() + "</td>";
    row += "<td class='TDs'>" + k + "</td>";
    row += "</tr>";
    n = Math.floor(n / b);
    //$("#cal2tbl tbody").append(row);
    var tableRef = document
      .getElementById("cal2tbl")
      .getElementsByTagName("tbody")[0];
    var newRow = tableRef.insertRow(k);
    newRow.innerHTML = row;
  }
  document.getElementById("cal2result").innerHTML =
    "= (" + y + ")<sub>" + b + "</sub>";
}

function validateInput() {
  const base = parseInt(sel1elem.value, 10);
  const value = xelem.value.toUpperCase();
  const validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, base) + ".";
  const isValid = [...value].every(char => validChars.includes(char) && (char !== '.' || value.indexOf('.') === value.lastIndexOf('.')));

  if (!isValid) {
    xelem.classList.add("input-error");
    const validCharsArray = validChars.slice(0, -1).split('');
    const lastChar = validCharsArray.pop();
    const validCharsString = validCharsArray.join(', ') + " & " + lastChar;
    document.getElementById("inputError").style.display = "block";
    document.getElementById("inputError").innerText = `Invalid input for base ${base}. Please use only characters: ${validCharsString}`;
    convertBtn.disabled = true;
    return false;
  } else {
    xelem.classList.remove("input-error");
    document.getElementById("inputError").style.display = "none";
    return true;
  }
}

function updateURLParams() {
  const params = new URLSearchParams(window.location.search);
  params.set('x', xelem.value.toUpperCase().trim());
  params.set('sel1', sel1elem.value);
  params.set('sel2', sel2elem.value);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

function onconvert() {
  if (!validateInput()) {
    alert("Please correct the input errors before converting.");
    return;
  }
  updateURLParams();
  var x = xelem.value.toUpperCase().trim();
  var b1 = sel1elem.selectedIndex + 2;
  var b2 = sel2elem.selectedIndex + 2;
  try {
    var y = new BigNumber(x, b1);
    xelem.style.background = "var(--form-bg)"; // Use CSS variable for background color
  } catch (err) {
    xelem.style.background = "var(--input-error-bg)"; // Use CSS variable for error background color
    yelem.value = "";
    return;
  }
  var dec = y.toString(10);
  y = y.toString(b2).toUpperCase();
  yelem.value = y;

  var yd = yelem.value.match(/[\dA-Z]/g);
  var ylabel = "Result number ";
  if (yd != null)
    ylabel += `(${yd.length}${(yd.length == 1) ? "digit":"digits"})`;
  document.getElementById("ylabel").innerHTML = ylabel;
  document.getElementById("b1txt").innerHTML = b1;
  document.getElementById("b2txt").innerHTML = b2;
  base2decimal(x, dec, b1);
  decimal2base(dec, y, b2);
  if (b1 == 10) cal1elem.style.display = "none";
  else cal1elem.style.display = "block";
  if (b2 == 10) cal2elem.style.display = "none";
  else cal2elem.style.display = "block";
  calgroup.style.display = "block";
}

function onrst() {
  calgroup.style.display = "none";
  if (confirm("Do you really want to clear?")) {
    onclear();
    console.log("Reset successful...");
  }
}
var inputTypeSelect = document.getElementById("sel1");
var existingInput = document.getElementById("x");

inputTypeSelect.addEventListener("change", () => {
  var selectedValue = parseInt(inputTypeSelect.value, 10);
  if (selectedValue >= 2 && selectedValue <= 10) {
    existingInput.type = "number";
  } else {
    existingInput.type = "text";
  }
});

xelem.addEventListener("input", () => {
  validateInput();
  toggleConvertButton();
});
sel1elem.addEventListener("change", validateInput);

function onclear() {
  xelem.value = "";
  yelem.value = "";
  calgroup.style.display = "none";
  toggleConvertButton();
}

function toggleConvertButton() {
  convertBtn.disabled = xelem.value.trim() === "";
  validateInput();
}
