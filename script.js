// Load list of cinemas from the API into cinema selector on the main page
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
                if (i == 0){
                    item.setAttribute("selected", true);
                }
                var name = x[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
                if (name == "Valitse alue/teatteri"){
                    name = "All Cinemas";
                }
                else if (name == "Pääkaupunkiseutu"){
                    name = "Capitol Area"
                }
                item.innerHTML = name;
                document.getElementById("cinemaList").appendChild(item);
            }
            document.getElementById("cinemaList").addEventListener("change", displayMovies);
        }
      };
}

// Load list of dates the API can be accessed for movies into date selector on the main page
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
                var item = document.createElement('option');
                var date = new Date(x[i].childNodes[0].nodeValue);
                item.setAttribute("value", date.toLocaleDateString());
                if (i == 0){
                    item.setAttribute("selected", true);
                }
                item.innerHTML = date.toLocaleDateString();
                document.getElementById("dateList").appendChild(item);
            }
            document.getElementById("dateList").addEventListener("change", displayMovies);
        }    
    }
}

// Displays list of movies
function displayMovies(){
    // Check for selected cinema and date and call API to get the specific schedule
    var cinemaID = document.getElementById("cinemaList").value;
    var dateOfMovies = document.getElementById("dateList").value.replace(/\//g,".");
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
            
            // Once we have received XML data from API, we separate them by <Show> tag name
            var xmlDoc = this.responseXML;
            var x = xmlDoc.getElementsByTagName("Show");
            var movieContainer = document.getElementById("movieSelection");
            movieContainer.innerHTML = "";
            
            // Create element with the selected date and append it to beginning of div container
            dateHeading = document.getElementById("date");
            dateHeading.innerHTML = dateOfMovies;
            
            // Loop thru our list of <Show> from API
            for(var i = 0; i < x.length; i++){
                // Create div container for the movie
                var item = document.createElement('div');
                item.setAttribute("class", "movie");

                // Create div holding img of the movie
                var picDiv = document.createElement('div');
                var pic = document.createElement('img');
                picDiv.setAttribute("class", "moviePic");
                
                // IF checking to get available portrait image (prioty: medium>large>small) because not all Shows in API have same sizes available
                if(x[i].getElementsByTagName("EventMediumImagePortrait").length > 0){
                    pic.setAttribute("src", x[i].getElementsByTagName("EventMediumImagePortrait")[0].childNodes[0].nodeValue);
                }
                else if(x[i].getElementsByTagName("EventLargeImagePortrait").length > 0){
                    pic.setAttribute("src", x[i].getElementsByTagName("EventLargeImagePortrait")[0].childNodes[0].nodeValue);
                }
                else{
                    pic.setAttribute("src", x[i].getElementsByTagName("EventSmallImagePortrait")[0].childNodes[0].nodeValue);
                }
        
                picDiv.appendChild(pic);
                item.appendChild(picDiv);

                // Create elements that hold information about the movie
                var info = document.createElement('div');
                info.setAttribute("class", "movieInfo");
                var title = document.createElement('h2');
                title.innerHTML = x[i].getElementsByTagName("OriginalTitle")[0].childNodes[0].nodeValue + " (" + x[i].getElementsByTagName("ProductionYear")[0].childNodes[0].nodeValue + ")";
                var startTime = document.createElement('h4');
                
                // Get movie showing start and convert it to hh:mm format
                var date = new Date(x[i].getElementsByTagName("dttmShowStart")[0].childNodes[0].nodeValue);
                startTime.innerHTML = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                
                var other = document.createElement('p');
                len = x[i].getElementsByTagName("LengthInMinutes")[0].childNodes[0].nodeValue;
                other.innerHTML = "Length: " + len + " min";
                
                // Check if there is Spoken Language listed and if so, translate the ISO code of the language to english term
                if(x[i].getElementsByTagName("SpokenLanguage").length > 0){
                    lan = dnStd.of(x[i].getElementsByTagName("SpokenLanguage")[0].getElementsByTagName("ISOTwoLetterCode")[0].childNodes[0].nodeValue);
                    other.innerHTML += "<br>Language: " + lan;
                }

                // Default to None subtitles, look if there are (one or two) subtitles for the movie listed and translate the ISO code of the language to english term
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
                movieContainer.appendChild(item);

            }
        }
    }
}
getCinemas();
getDates();