const firebaseConfig = {
    apiKey: "AIzaSyBI2x32t1zD7Q2EBJsZADC5nB6bzkZH8H8",
    authDomain: "fb-eleicao-7de96.firebaseapp.com",
    projectId: "fb-eleicao-7de96",
    storageBucket: "fb-eleicao-7de96.appspot.com",
    messagingSenderId: "1044584623263",
    appId: "1:1044584623263:web:2fbfac15b847a3a23686aa"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function enviarParaOFb(name, candidate) {
    db.collection("votes").add({
        name: name,
        candidate: candidate
    })
        .then(function (docRef) {
            console.log("Id", docRef.id);
            alert("Voto computado");
        })
        .catch(function (error) {
            alert("Ocorreu um erro", error);
        })

}


function updateTableWithVotes() {
    const votesRef = db.collection("votes");
    const voteTableBody = document.getElementById("voteTableBody");

    votesRef.get()
        .then((querySnapshot) => {
            const rowsById = {};

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const rowId = doc.id;

                let row = rowsById[rowId];

                if (!row) {
                    row = document.createElement("tr");
                    rowsById[rowId] = row;
                }

                row.innerHTML = `<td>${rowId}</td><td>${data.name}</td><td>${data.candidate}</td>`;
            });
            voteTableBody.innerHTML = "";
            for (const rowId in rowsById) {
                if (rowsById.hasOwnProperty(rowId)) {
                    voteTableBody.appendChild(rowsById[rowId]);
                }
            }
        })
        .catch((error) => {
            console.error("Error documents", error);
        });
    updatePieChart();
}


document.addEventListener("DOMContentLoaded", function () {
    updateTableWithVotes();

});

setInterval(updateTableWithVotes, 1000);




document.getElementById("submit").addEventListener("click", function () {
    const name = document.getElementById("name").value;
    const candidate = document.getElementById("select").value;

    if (name && candidate) {
        if (!hasVotedBefore()) {
            enviarParaOFb(name, candidate);
            setVotedCookie();
        } else {
            alert("Você já votou uma vez.");
        }
    } else {
        alert("Preencha todos os campos.");
    }
});


function getVotesData() {
    const votesRef = db.collection("votes");

    return votesRef.get()
        .then((querySnapshot) => {
            const voteData = {
                votePedro: 0,
                voteNicolas: 0
            };

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.candidate === 'Pedro') {
                    voteData.votePedro++;
                } else if (data.candidate === 'Nicolas') {
                    voteData.voteNicolas++;
                }
            });

            return voteData;
        })
        .catch((error) => {
            console.error("Erro ao obter dados do Firebase", error);
            throw error;
        });
}


function updatePieChart(voteData) {
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');

    // Dados para o gráfico de pizza
    const data = [voteData.votePedro, voteData.voteNicolas];

    // Labels para o gráfico
    const labels = ['Pedro', 'Nicolas'];

    // Cores para as fatias do gráfico
    const colors = ['red', 'green'];

    // Crie o gráfico de pizza
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        }
    });
}

getVotesData()
    .then((voteData) => {
        updatePieChart(voteData);
    })
    .catch((error) => {
        console.error("Erro ao obter dados do Firebase", error);
    });



function hasVotedBefore() {
    return document.cookie.split(';').some((item) => item.trim().startsWith('voted='));
}


function setVotedCookie() {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 dia
    document.cookie = `voted=true; expires=${expirationDate.toUTCString()}`;
}
