// Loads a list of cinemas from API
function getCinemas(){
    var url = "https://www.finnkino.fi/xml/TheatreAreas/";
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlDoc = this.responseXML;
            var x = xmlDoc.getElementsByTagName("TheatreArea");
            for(var i = 0; i < x.length; i++){
                var item = document.createElement('option');
                item.setAttribute("value", x[i].getElementsByTagName("ID")[0].childNodes[0].nodeValue);
                item.innerHTML = x[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
                document.getElementById("cinemaList").appendChild(item);
            }
            document.getElementById("cinemaList").addEventListener("change", displayMovies);
        }
      };
}

function getDates(){
    // Get list of available schedule dates from API
    var url = "https://www.finnkino.fi/xml/ScheduleDates/";
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlDoc = this.responseXML;
            var x = xmlDoc.getElementsByTagName("dateTime");
            for(var i = 0; i < x.length; i++){
                console.log("Adding date: " + x[i].childNodes[0].nodeValue);
                var item = document.createElement('option');
                var date = new Date(x[i].childNodes[0].nodeValue);
                item.setAttribute("value", date.toLocaleDateString());
                item.innerHTML = date.toLocaleDateString();
                document.getElementById("dateList").appendChild(item);
            }
            document.getElementById("dateList").addEventListener("change", displayMovies);
        }
    }
}

// Displays schedule for today for selected cinema
function displayMovies(){
    // Check selected cinema and date
    var cinemaID = document.getElementById("cinemaList").value;
    var dateOfMovies = document.getElementById("dateList").value.replace(/\//g,".");

    console.log("Looking for movies from cinema " + cinemaID + " and on date " + dateOfMovies);
    var url = "https://www.finnkino.fi/xml/Schedule/?area=" + cinemaID + "&dt=" + dateOfMovies;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.send();
    // Create this object to translate ISO codes to language names for later use
    var dnStd = new Intl.DisplayNames("en", {
        type: "language",
        languageDisplay: "standard",
    });
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Got data from API under url " + url);
            var xmlDoc = this.responseXML;
            var x = xmlDoc.getElementsByTagName("Show");
            var movieContainer = document.getElementById("movieSelection");
            movieContainer.innerHTML = "";
            // Create element with the selected date and append it to beginning of div container
            dateHeading = document.getElementById("date");
            dateHeading.innerHTML = dateOfMovies;

            for(var i = 0; i < x.length; i++){
                // Create div container for the movie
                var item = document.createElement('div');
                item.setAttribute("class", "movie");

                // Create img of the movie
                var pic = document.createElement('img');
                pic.setAttribute("src", x[i].getElementsByTagName("EventSmallImagePortrait")[0].childNodes[0].nodeValue);
                item.appendChild(pic);

                // Create elements that hold information about the movie
                var info = document.createElement('div');
                var title = document.createElement('h2');
                title.innerHTML = x[i].getElementsByTagName("OriginalTitle")[0].childNodes[0].nodeValue + " (" + x[i].getElementsByTagName("ProductionYear")[0].childNodes[0].nodeValue + ")";
                var startTime = document.createElement('h4');
                var date = new Date(x[i].getElementsByTagName("dttmShowStart")[0].childNodes[0].nodeValue);
                startTime.innerHTML = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                var other = document.createElement('p');
                len = x[i].getElementsByTagName("LengthInMinutes")[0].childNodes[0].nodeValue;
                other.innerHTML = "Length: " + len + " min";
                if(x[i].getElementsByTagName("SpokenLanguage").length > 0){
                    lan = dnStd.of(x[i].getElementsByTagName("SpokenLanguage")[0].getElementsByTagName("ISOTwoLetterCode")[0].childNodes[0].nodeValue);
                    other.innerHTML += "<br>Language: " + lan;
                }
                var sub = "None";
                if(x[i].getElementsByTagName("SubtitleLanguage1").length > 0){
                    sub = dnStd.of(x[i].getElementsByTagName("SubtitleLanguage1")[0].getElementsByTagName("ISOTwoLetterCode")[0].childNodes[0].nodeValue);
                }
                if(x[i].getElementsByTagName("SubtitleLanguage2").length > 0){
                    sub = sub + ", " + dnStd.of(x[i].getElementsByTagName("SubtitleLanguage2")[0].getElementsByTagName("ISOTwoLetterCode")[0].childNodes[0].nodeValue);
                }
                other.innerHTML += "<br>Subtitles: " + sub;
                info.appendChild(title);
                info.appendChild(startTime);
                info.appendChild(other);
                item.appendChild(info);
                // Append the new div to div container
                movieContainer.appendChild(item);

            }
        }
    }
}
getCinemas();
getDates();