/***
  
  Auteur : Caroline OBER
  
 **/

var morpion = {
	 // cet tableau contient des pointeurs directs vers les cases 
   // (noeuds <td> du DOM) du plateau dans la page html
  dom_plateau: [],
  // un entier: 1 ou 2 (le numéro du prochain joueur)
  turn: 1,
  /* un entier:
     0: la partie continue
     -1: la partie est nulle
     1: joueur 1 a gagné
     2: joueur 2 a gagné
   */
  game_status: 0,
  // Nombre de coups joués
  coups: 0,
  // Nombre de lignes
  n: 3,
  // Nombre de colonnes
  m: 3,

  /*
    Intialise un plateau de jeu de dimensions `lignes` × `colonnes`
    et l'ajoute dans l'élément `parent` du dom.
   */
	init: function(parent, lignes, colonnes) {
    //créer le plateau html et affecter les pointeurs directs
    if (lignes) this.n = lignes;
    if (colonnes) this.m = colonnes;

    var t = document.createElement('table');
    t.id = 'plateau';

    for (var i = 1; i <= this.n ; i++) {
      var tr = document.createElement('tr');
      this.dom_plateau[i] = [];
      for (var j = 1; j <= this.m; j++) {
        var td = document.createElement('td');
        td.dataset.column = i + '-' + j;
        tr.appendChild(td);
        this.dom_plateau[i][j] = td;
      }
      t.appendChild(tr);
    }
    parent.innerHTML = '';
    parent.appendChild(t);

	  t.addEventListener('click', function(e) { morpion.handler(e); });
	},

	// function auxiliaire d'affichage 
	set: function(ligne, column, player) {
    // On ajoute une perso à la case
	  this.dom_plateau[ligne][column].className = 'joueur' + player;
    // On compte le coup
    this.coups++;
    // On passe le tour : 3 - 2 = 1, 3 - 1 = 2
    this.turn = 3 - this.turn;
	},

  /* Cette fonction ajoute un pion dans une colonne */
	play: function(ligne, column) {
    if (!this.dom_plateau[ligne][column].className) {
		  // Effectuer le coup
		  this.set(ligne, column, this.turn);
    } 

    // on test s'il y a un gagnant au bout de 5 coups sinon ça ne sert à rien de tester
    if (this.coups >= 5) {
      // Vérifier s'il y a un gagnant, ou si la partie est finie
  		if (this.win(ligne, column, 'joueur' + (3 - this.turn))) {
  		  this.game_status = 3 - this.turn;
  		} else if (this.coups >= this.n * this.m) {
  		  this.game_status = -1;
  		}
    }

		//Au cours de l'affichage, pensez eventuellement, à afficher un 
		//message si la partie est finie...
		switch (this.game_status) {
		  case -1: 
			//window.alert("Partie Nulle!!"); 
      this.message("Partie Nulle !!");
      this.replay();
			break;
		  case 1:
      this.message("Victoire du joueur 1 !");
      this.replay();
			break;
		  case 2:
      this.message("Victoire du joueur 2 !");
      this.replay();
			break;
		}
	},

	//le gestionnaire d'événements
	handler: function(event) {
    var data = event.target.dataset.column.split('-');
    var ligne = data[0];
	  var column = data[1];

  	//attention, les variables dans les datasets sont TOUJOURS 
  	//des chaînes de caractère. Si on veut être sûr de ne pas faire de bêtise,
  	//il vaut mieux la convertir en entier avec parseInt
  	if (column && ligne) 
    	this.play(parseInt(ligne),parseInt(column));
	},
    
  /* 
   Cette fonction vérifie si le coup dans la case `ligne`, `column` par
   le joueur `cname` est un coup gagnant.
   
   Renvoie :
     true  : si la partie est gagnée par le joueur `cname`
     false : si la partie continue
 */
	win: function(ligne, column, cname) {
		// Horizontal
    var count = 0;
    for (var j = 1; j <= this.m; j++) {
      count = (this.dom_plateau[ligne][j].className == cname) ? count+1 : 0;
      if (count >= 3) return true;
    }

		// Vertical
    count = 0;
    for (var i = 1; i <= this.n; i++) {
      count = (this.dom_plateau[i][column].className == cname) ? count+1 : 0;
	    if (count >= 3) return true;
    }

		// Diagonal
    count = 0;
    for (var i = 1; i <= this.n; i++) {
      //console.log('diagonale : ' + i + ' - ' + (i - shift));
      // On test avec i ayant la même valeur car la diagonale est toujours 1-1, 2-2, 3-3
      count = (this.dom_plateau[i][i].className == cname) ? count+1 : 0;
    	if (count >= 3) return true;
    }

		// Anti-diagonal
    // On test 3-1, 2-2, 1-3
    count = 0;
    var j = this.n;
    for (var i = 1 ; i <= this.n; i++) {
      console.log('anti diagonale : ' + j + ' - ' + i);
      count = (this.dom_plateau[j][i].className == cname) ? count+1 : 0;
      j--;
      if (count >= 3) return true;
    }
    
    return false;
	},

  message : function(contentMessage, type) {
    if (type == "reset") {
      if (document.getElementById("overlay").classList == "visible") {
        document.getElementById("overlay").classList.remove("visible");
        document.getElementById("overlay").classList.add("hidden");
      }

      document.getElementById("overlay").removeChild(document.getElementById("message"));

    } else {
      // Initialise la zone du message
      var message = document.createElement('div');
      message.id = 'message';

      var textMessage = document.createElement('p');
      textMessage.id = "textMessage";
      textMessage.textContent = contentMessage.toString();

      var boutonReplay = document.createElement('button');
      boutonReplay.textContent = "Rejouer";
      boutonReplay.id = 'replay';

      message.appendChild(textMessage);
      message.appendChild(boutonReplay);

      document.getElementById("overlay").appendChild(message);
      document.getElementById("overlay").classList.remove("hidden");
      document.getElementById("overlay").classList.add("visible");

    }

  },

  replay: function() {
    var replay = document.getElementById("replay");
    replay.addEventListener('click', function() { 
      morpion.message("", "reset");
      morpion.reset(); 
    });
  },

  // Cette fonction vide le plateau et remet à zéro l'état
  reset: function() {
    for (var i = 1; i <= this.n; i++) {
      for (var j = 1; j <= this.m; j++) {
        this.dom_plateau[i][j].className = "";
      }
    }
		this.coups = 0;
    this.game_status = 0;
	},
}

// On initialise le plateau et on l'ajoute à l'arbre du DOM
// (dans la balise d'identifiant `jeu`).
morpion.init(document.querySelector('#jeu'));



