//Se minaPersoner.json för exempel på hur personobjekt ska se ut
//Se minaEvent.json för exempel på hur eventobjekt ska se ut


document.addEventListener('DOMContentLoaded', function() {
    resetForm()
    var vacationView = false
    var tooltip = document.getElementById('tooltip')
    var editBox = document.getElementById('edit-box')
    var cover = document.getElementById('cover')

    var intitialResourceLoadPerformed = false

    var calendarEl = document.getElementById('calendar')
    var formPerson = document.getElementById("formPerson")
    var formReason = document.getElementById("formReason")
    var formMessage = document.getElementById("formMessage")
    var formStartTime = document.getElementById("formStartTime")
    var formEndTime = document.getElementById("formEndTime")

    let calendar = new FullCalendar.Calendar(calendarEl, {
        weekNumbers: 'true',
        resourceOrder: 'title, id',
        dayHeaders: 'true',
        // filterResourcesWithEvents: 'true', //avkommentera för att filtrera bort personer utan frånvaro
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        locale: 'sv',
        initialView: 'resourceTimelineWeek', //Byt ut resourceTimelineWeek till resourceTimelineDay, resourceTimelineMonth, resourceTimelineYear för att ändra standardvy
        height: 'auto',
        resourceAreaWidth: '70px',
        scrollTime: millisecondsSinceNewYears(),
        navLinks: true,
        weekends: false,
        // timeZone: 'Europe/Stockholm',
        slotMinTime: '08:00',
        slotMaxTime: '17:00',
        headerToolbar: {
            right: 'today prev,next',
            center: 'title',
            left: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear'
        },
        footerToolbar: {
            left: 'personAdder,personRemover',
            center: '',
            right: 'vacationView'
        },
        titleFormat: {
            month: 'long',
            year: 'numeric',
            day: 'numeric',
        },

        eventClick: function(info) {
            var date = calendar.getDate();
            initialLoad()

            var eventObj = info.event;
            //sends eventinfo to html
            document.getElementById("tooltipHeading").innerHTML = eventObj.getResources()[0].title + " - " + eventObj.title
            if (eventObj.extendedProps.description) {
                document.getElementById("tooltipDescription").innerHTML = eventObj.extendedProps.description
            } else {
                document.getElementById("tooltipDescription").innerHTML = ''
            }
            const format = {
                weekday: 'long',
                day: "numeric",
                month: "short",
                year: "numeric"
            };
            if (eventObj.start.toLocaleString('sv-SE', format).localeCompare(eventObj.end.toLocaleString('sv-SE', format))) {
                document.getElementById("tooltipTime").innerHTML = "<em>Från: </em>" + eventObj.start.toLocaleString('sv-SE', format) + " " + eventObj.start.toLocaleTimeString().substring(0, 5) + " <br> <em>Till:</em> " + eventObj.end.toLocaleString('sv-SE', format) + " " + eventObj.end.toLocaleTimeString().substring(0, 5)
            } else {
                document.getElementById("tooltipTime").innerHTML = "<em>" + eventObj.start.toLocaleTimeString().substring(0, 5) + " - " + eventObj.end.toLocaleTimeString().substring(0, 5) + "</em> " + eventObj.end.toLocaleString('sv-SE', format)
            }

            show(tooltip)


            var elems = document.getElementsByClassName("cancel-button");
            for (var i = 0, len = elems.length; i < len; i++) {
                elems[i].onclick = function() {
                    hide(tooltip)
                    hide(editBox)
                }
            }



            //edit event
            document.getElementById("edit-button").onclick = function(event) {
                hide(tooltip)
                show(editBox)

                document.getElementById("editPerson").innerHTML = document.getElementById("formPerson").innerHTML
                document.getElementById("editPerson").value = eventObj.getResources()[0].title

                document.getElementById("editReason").innerHTML = document.getElementById("formReason").innerHTML
                document.getElementById("editReason").value = eventObj.title

                if (eventObj.extendedProps.description) {
                    document.getElementById("editMessage").value = eventObj.extendedProps.description
                } else {
                    document.getElementById("editMessage").value = ''
                }

                document.getElementById("editStartTime").value = dateFormatter(eventObj.start) + 'T' + eventObj.start.toLocaleTimeString().substring(0, 5)

                document.getElementById("editEndTime").value = dateFormatter(eventObj.end) + 'T' + eventObj.end.toLocaleTimeString().substring(0, 5)
                document.getElementById("save-edits-button").onclick = function(event) {
                    addEvent(editPerson, editReason, editMessage, editStartTime, editEndTime)
                    eventObj.remove()
                        // TO DO: TA BORT FRÅN SERVERN
                    hide(editBox)
                }
            }


            document.getElementById("remove-button").onclick = function(event) {
                //TO DO: TA BORT EVENT FRÅN SERVERN
                eventObj.remove()
                hide(tooltip)
                hide(editBox)
            }
            cover.onclick = function() {
                if (tooltip.style.display == "block") { hide(tooltip) }
            }

        },

        views: {
            //Dagsvy
            resourceTimelineDay: {
                titleFormat: {
                    month: 'long',
                    year: 'numeric',
                    day: 'numeric',
                    weekday: 'long'
                },
                slotDuration: { minutes: 15 },
                displayEventTime: true
            },
            //Veckovy
            resourceTimelineWeek: {
                slotDuration: { hours: 1 },
                displayEventTime: false
            },
            //Månadsvy
            resourceTimelineMonth: {
                titleFormat: {
                    month: 'long',
                    year: 'numeric'
                },
                displayEventTime: false
            },
            //Årsvy
            resourceTimelineYear: {
                titleFormat: { year: 'numeric' },
                buttonText: 'År',
                slotDuration: { weeks: 1 },
            },
            //Listvy
            listMonth: {
                titleFormat: {
                    month: 'long',
                    year: 'numeric'
                },
            }
        },

        customButtons: {
            vacationView: {
                text: 'Semestervy',
                click: function() {
                    events = calendar.getEvents()

                    if (vacationView == false) {

                        for (let index = 0; index < events.length; index++) {
                            if (events[index].title != "Semester" && events[index].title != "Föräldraledig" && events[index].title != "Vård av barn" && events[index].title != "Tjänstledig" && events[index].title != "Övrigt")
                                events[index].setProp('display', 'none')
                        }
                        vacationView = true
                    } else {
                        events.forEach(element => {
                            element.setProp('display', 'block')
                            vacationView = false
                        });

                    }
                }

            },
            personAdder: { //personAdder lägger till nya personer till systemet
                text: '+ Lägg till ny person',
                click: function() {
                    var title = prompt('Ange namn på den person du vill lägga till:');
                    if (title) {
                        let lista = calendar.getResources()
                        let personExists = false;
                        for (let index = 0; index < lista.length; index++) {
                            if (lista[index].title.toLowerCase() == title.toLocaleLowerCase()) {
                                personExists = true;
                            }
                        }
                        if (!personExists) {
                            calendar.addResource({ title: title });
                            loadPersonsToDialog(calendar.getResources())
                                // TODO: POSTA PERSON TILL SERVERN
                            alert(title + " lades till.")
                        } else {
                            alert(title + " kunde inte läggas till eftersom personen redan finns i systemet.")
                        }
                    }
                }
            },
            personRemover: { //personRemover tar bort personer från systemet
                text: '- Ta bort person',
                click: function() {
                    var title = prompt('Ange namn på den du vill ta bort:');
                    if (title) {
                        let lista = calendar.getResources()
                        for (let index = 0; index < lista.length; index++) {
                            if (lista[index].title.toLowerCase() == title.toLocaleLowerCase()) {
                                var confirmation = confirm('Du kommer nu att ta bort ' + lista[index].title + ' från systemet. Gör inte detta om du inte är säker på vad du gör.')
                                if (confirmation) {
                                    lista[index].remove();
                                    // TO DO: TA BORT PERSON FRÅN SERVER
                                    alert(title + " togs bort från systemet.")
                                }
                            }
                        }
                    }
                }
            },
        },

        resourceAreaHeaderContent: ' ',
        resources: 'minaPersoner.json', //TO DO: ersätt med feed från server. Se https://fullcalendar.io/docs/resources-json-feed
        events: 'minaEvent.json' //TO DO: ersätt med feed från server. Se https://fullcalendar.io/docs/events-json-feed


    });




    //When submit button is clicked
    document.getElementById("submit-button").onclick = function(event) { //Adds event based on html form data
        event.preventDefault()
            //validation
        addEvent(formPerson, formReason, formMessage, formStartTime, formEndTime)
    }
    loadPersonsToDialog(calendar.getResources())

    function addEvent(formPerson, formReason, formMessage, formStartTime, formEndTime) {
        if (!formPerson.checkValidity()) {
            indicateInvalidField(formPerson)
        } else if (!formReason.checkValidity()) {
            indicateInvalidField(formReason)
        } else if (!formMessage.checkValidity()) {
            indicateInvalidField(formMessage)
        } else if (!formStartTime.checkValidity()) {
            indicateInvalidField(formStartTime)
        } else if (!formEndTime.checkValidity()) {
            indicateInvalidField(formEndTime)
        } else {

            if (Date.parse(formEndTime.value) < Date.parse(formStartTime.value)) {
                [formStartTime.value, formEndTime.value] = [formEndTime.value, formStartTime.value]
            }

            calendar.addEvent({
                    resourceId: getResourceIdFromTitle(formPerson.value),
                    description: formMessage.value,
                    title: formReason.value,
                    start: formStartTime.value,
                    end: formEndTime.value,
                    color: eventBackgroundColorCoder(formReason.value),
                    get textColor() {
                        hexcolor = this.color
                        hexcolor = hexcolor.replace("#", "");
                        var r = parseInt(hexcolor.substr(0, 2), 16);
                        var g = parseInt(hexcolor.substr(2, 2), 16);
                        var b = parseInt(hexcolor.substr(4, 2), 16);
                        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                        return (yiq >= 128) ? 'black' : 'white';
                    },

                })
                // TO DO: POSTA EVENT TILL SERVERN
            resetForm()
        }
    }


    function getResourceIdFromTitle(person) {
        let lista = calendar.getResources()
        for (let index = 0; index < lista.length; index++) {
            if (lista[index].title.toLowerCase() == person.toLocaleLowerCase()) {
                return lista[index].id
            }
        }
    }


    calendar.render();


    document.getElementById("formPerson").addEventListener("click", initialLoad);

    function initialLoad() {
        if (!intitialResourceLoadPerformed) {
            loadPersonsToDialog(calendar.getResources())
        }
        intitialResourceLoadPerformed = true
    }

});



var divs = document.querySelectorAll('.personSelect');

for (i = 0; i < divs.length; ++i) {
    divs[i].click();
};

function eventBackgroundColorCoder(description) {
    if (description.toLowerCase() == "arbetar hemma") { //3
        return "#D2BBD7"
    } else if (description.toLowerCase() == "arbetar hos kund") { //6
        return "#AE75A2"
    } else if (description.toLowerCase() == "deltidsledig") { //9
        return "#882D71"
    } else if (description.toLowerCase() == "föräldraledig") { //10
        return "#1964B0"
    } else if (description.toLowerCase() == "gått för dagen") { //12
        return "#518AC6"
    } else if (description.toLowerCase() == "kompledig") { //14
        return "#7BB0DF"
    } else if (description.toLowerCase() == "kundbesök") { //15
        return "#4DB264"
    } else if (description.toLowerCase() == "möte") { //16
        return "#90C886"
    } else if (description.toLowerCase() == "semester") { //17
        return "#CAE1AC"
    } else if (description.toLowerCase() == "sjuk") { //18
        return "#F7F057"
    } else if (description.toLowerCase() == "tjänsteresa") { //20
        return "#F6C140"
    } else if (description.toLowerCase() == "tjänstledig") { //22
        return "#F2932D"
    } else if (description.toLowerCase() == "vård av barn") { //24
        return "#E8601C"
    } else if (description.toLowerCase() == "övrigt") { //26
        return "#DB060B"
    }
}

function resetForm() {
    var today = dateFormatter(new Date())
    document.getElementById("formReason").value = ""
    document.getElementById("formMessage").value = ""
    document.getElementById("formStartTime").value = today + 'T08:00:00'
    document.getElementById("formEndTime").value = today + 'T17:00:00'

}

function loadPersonsToDialog(personer = []) {


    personer.sort((a, b) => {
        let fa = a.title.toLowerCase(),
            fb = b.title.toLowerCase();

        if (fa < fb) {
            return -1;
        }
        if (fa > fb) {
            return 1;
        }
        return 0;
    });
    var x = document.getElementById("formPerson");
    x.innerHTML = ""
    var option = document.createElement("option");
    option.text = ""
    x.add(option)


    for (let index = 0; index < personer.length; index++) {
        option = document.createElement("option");
        option.text = personer[index].title
        x.add(option);
    }


}

function indicateInvalidField(field) {
    field.animate([
        { color: '#000' },
        { color: '#E7750A', border: "5px solid #E7750A" },
        { color: '#000' }
    ], {
        duration: 300,
        iterations: 1
    })
}


function millisecondsSinceNewYears() {
    var now = new Date().getTime()
    var start = new Date(new Date().getFullYear(), 0, 1).getTime()
    return now - start
}

function dateFormatter(date) {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();
    return yyyy + '-' + mm + '-' + dd
}

function hide(element) {
    element.style.display = "none"
    cover.style.display = "none"
}

function show(element) {
    element.style.display = "block"
    cover.style.display = "block"
}