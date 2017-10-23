import { platformBrowserDynamic }   from "@angular/platform-browser-dynamic";
import { Component }                from "@angular/core";
import { BrowserModule }    		from "@angular/platform-browser";
import { NgModule } 				from "@angular/core";

import { DragDropModule } 			from "./DragDropModule";

let template = `
	<h1 alx-dragdrop>Test of alx-dragdrop</h1>
	<section [alx-draggable]="lab">
		<label #lab>A paragraphe with a lot of text...</label> 
		Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
		totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt 
		explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur 
		magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor 
		sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore 
		magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit 
		laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate 
		velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
	</section>
	<ul>
		<li><img [alx-draggable]="imgMag" src="http://mag.mo5.com/wp-content/uploads/2013/06/ban1.png" #imgMag/></li>	
		<li>
			<section class="p_img" 
					 [alx-draggable]  = "imgCPC"
					 (alx-drag-start) = "Log('DragStart from p_img')"
					 (alx-drag-end)   = "Log('DragEnd from p_img')"
					 [alx-start-delay]="200"
					 >
				<img src="http://www.cpcwiki.eu/forum/logo_new_hor_sm.png" #imgCPC/>
				Ce projet a débuté en 1983, Amstrad, société britannique produisant du matériel HI-FI dirigée par Alan 
				Michael Sugar (souvent abrégé en "AMS"), est à la recherche d'un nouveau créneau. AMS voit une place 
				vacante dans le marché de la micro-informatique de l'époque : jusque-là, en effet, elle s'adressait 
				avant tout à des « hobbyistes », passionnés ou susceptibles de le devenir (d'où des ordinateurs peu 
				chers, mais en kit ou avec tant de branchements à réaliser qu'ils en devenaient rapidement des 
				cauchemars de plombiers, ou des appareils à la pointe de la technique, mais très chers et encore à 
				moitié expérimentaux).
				Alan Sugar choisit de s'adresser à une clientèle résolument familiale, inexpérimentée et sans grands 
				moyens : il décide donc de vendre un ordinateur dont l'installation est la plus simple possible, et qui 
				soit directement utilisable même par un profane dès la mise sous tension (d'où le moniteur inclus et le 
				nombre de câbles remarquablement réduit pour l'époque), le tout pour le même prix qu'un Commodore 64 
				sans écran. Le fait de fournir un moniteur couleur ou monochrome avec l'ordinateur pour un prix 
				abordable participa grandement au succès de ces ordinateurs, les modèles concurrents nécessitaient 
				souvent de monopoliser le téléviseur du salon. De plus, pour rester dans cette logique de clientèle 
				familiale, Amstrad va organiser ses points de vente uniquement sur la base de la grande distribution.
				En 1984 sort l'Amstrad CPC 464, comprenant 64 Ko de mémoire vive, vendu avec un écran monochrome (vert) 
				ou un écran couleur et, chose inhabituelle à l'époque, un lecteur de cassettes intégré. L’Amstrad CPC 
				464 connaît dès sa sortie un immense succès, surtout en France, se vendant à plus d'un million 
				d’exemplaires.
				En 1985 sortent successivement l'Amstrad CPC 664 où le lecteur de cassettes est remplacé par un lecteur 
				de disquettes, puis l'Amstrad CPC 6128, où la mémoire vive est portée à 128 Ko.
				En 1990, voyant les ventes de ces CPC décliner, Amstrad tenta de reprendre le marché avec une version 
				plus évoluée du CPC (le CPC+) ainsi qu'une console de jeux (la GX-4000) (voir Tilt no 82) : 4096 
				couleurs, sprites gérés par le matériel, canaux DMA pour le son, port cartouche, nouveau design. Ces 
				machines n'avaient cependant plus assez d'atouts face aux Amiga de Commodore et autres 520ST d'Atari de 
				l'époque ou de la Mega Drive. La gamme CPC+ et GX-4000 disparut rapidement des rayons.
			</section>
		</li>	
	</ul>
	<section class="dropzones">
		<section class="s1"
				 alx-dropzone
				 alx-drag-css        = "dropCandidate"
				 alx-drag-over-css   = "canDrop"
				 alx-drag-over-css-for-draggable = "canBeDropped"
				 [alx-accept-function] = "isHTML_Element"
				 (alx-ondrop)     = "Append($event, section1)"
				 (alx-drag-start) = "Log('DragStart from section 1')"
				 (alx-drag-end)   = "Log('DragEnd from section 1')"
				 (alx-drag-enter) = "Log('DragEnter from section 1')"
				 (alx-drag-leave) = "Log('DragLeave from section 1')"
				 #section1
				 >
			Drop zone 1
		</section>
		<section class="s2"
				 alx-dropzone
				 alx-drag-css        = "dropCandidate"
				 alx-drag-over-css   = "canDrop"
				 [alx-accept-function] = "isDragNativeHTML"
				 (alx-ondrop)     = "AppendHTML_Drag($event, section2)"
				 (alx-drag-start) = "Log('DragStart from section 2')"
				 (alx-drag-end)   = "Log('DragEnd from section 2')"
				 (alx-drag-enter) = "Log('DragEnter from section 2')"
				 (alx-drag-leave) = "Log('DragLeave from section 2')"
				 #section2
				 >
			Drop zone 2: for native HTML5 drag events
		</section>
	</section>
`;

let style = `
	section.dropzones {
		display: flex;
		flex-flow: row;
	}
	section.dropzones > section {
		border: solid black 1px;
		min-height: 100px;
		flex: 1 1;
	}
	section.dropzones > section.dropCandidate.s2,
	section.dropzones > section.dropCandidate.s1 {
		background: lightyellow;
	}
	section.dropzones > section.dropCandidate.canDrop {
		background: yellow;
	}
	section.dropzones > section.s1 {
		background: orange;
	}
	section.dropzones > section.s2 {
		background: cyan;
	}
	ul li section.p_img {
		border: solid green 1px;
		background: lightyellow;
	}
	ul li section.p_img img {
		position: float;
		float: left;
	}
`;


@Component({
	selector	: "root-manager",
	template	: template,
	styles      : [ style ]
})
class RootManager {
    constructor() {
        console.log("root-manager isntantiated");
    }
	isHTML_Element(data: any) {
		return HTMLElement.prototype.isPrototypeOf( data );
		// return typeof data === "string";
	}
	Log(str: string) {
		let dragClone = document.querySelector( "body > .alx-cloneNode" );
		console.log("Log", str, "with cloneNode", dragClone); //?"exists":"don't exists");
	}
	Append(data: HTMLElement, element: HTMLElement) {
		element.appendChild( data.cloneNode(true) );
	}
	isDragNativeHTML(data: any) : boolean {
		console.log( "isDragNativeHTML:", data.dataTransfer?true:false );
		return data.dataTransfer;
	}
	AppendHTML_Drag(event: DragEvent, element: HTMLElement) {
		console.log( "AppendHTML_Drag", event);
		let p = document.createElement( "p" );
		p.innerHTML = event.dataTransfer.getData( "text/html" );
		element.appendChild( p );
	}
}

//enableProdMode();
@NgModule({
	imports     : [ BrowserModule, DragDropModule ],
	declarations: [ RootManager ],
	bootstrap   : [ RootManager ]
})
export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);

console.log("main.ts loaded");