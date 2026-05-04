import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AlertController } from '@ionic/angular';


interface SchlagzeilenItem {

  schlagzeile: string;
  inland     : boolean;
  ort        : string;
}


interface SchlagzeilenAntwort {

  items: SchlagzeilenItem[];
  anzahl: number;
}


/**
 * Für Verwendung HttpClient muss in der Datei "app.module.ts" die Methode
 * `provideHttpClient()` als Provider registriert werden.
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

    /** Objektvariable für Interpolation: enthält angezeigte Schlagzeile */
    public schlagzeile: string = "Noch keine Schlagzeile geladen.";

    /** URL für Abruf einer Schlagzeile von Web-API.
     * Doku: https://api.el-decker.de/badnews_doku.html
     *
     * Beispiel für JSON-Antwort der Web-API:
     * ```
     * {
     *   "items": [
     *     {
     *      "schlagzeile": "Weißwurst-Diebstahl in Bayern",
     *      "inland"     : true,
     *      "ort"        : "Bayern"
     *    }
     *   ],
     *   "anzahl": 1
     * }
     * ```
     */
    readonly URL_WEBAPI = "https://api.el-decker.de/badnews.php?nur_inland=true";


    /**
     * Konstruktor für *Dependency Injection*.
     */
    constructor( private httpClient: HttpClient,
                 private alertCtrl : AlertController ) {}


    /**
     * Event-Handler für Button, der Web-API-Request auslöst.
     */
    public onSchlagzeileLadenButton() {

        const httpRequestObservable =
          this.httpClient.get<SchlagzeilenAntwort>( this.URL_WEBAPI );
        // wenn noch HTTP-Header setzt werden soll:
        // https://gist.github.com/MDecker-MobileComputing/dbc5de33be006a96bd7892726c0be482

        httpRequestObservable.subscribe({
            next : (antwort) => this.verarbeiteHttpResponse( antwort ),
            error: (fehler ) => this.verarbeiteHttpFehler(   fehler  )
        });
    }


    /**
     * Event-Handler für erfolgreiche HTTP-Response.
     *
     * @param schlagzeilenAntwort Response-Body der Web-API, der die Schlagzeile enthält.
     */
    private async verarbeiteHttpResponse( schlagzeilenAntwort: SchlagzeilenAntwort ) {

      console.log( "HTTP-Response erhalten:", schlagzeilenAntwort ) ;

      const schlagzeilenItem = schlagzeilenAntwort.items[0];

      if ( schlagzeilenItem == null ) {

        await this.zeigeFehlerAlert( "Keine Schlagzeile in der Antwort erhalten." );
        return;
      }

      this.schlagzeile = schlagzeilenItem.schlagzeile;
    }


    /**
     * Event-Handler für Fehler bei HTTP-Request.
     *
     * @param fehler Objekt mit Informationen zum Fehler
     */
    private async verarbeiteHttpFehler( fehler: HttpErrorResponse ) {

        console.error( "Fehler bei HTTP-Request:", fehler ) ;

        await this.zeigeFehlerAlert( fehler.message );
    }


    /**
     * Hilfsmethode zum Anzeigen eines Alert-Dialogs mit Fehlermeldung.
     *
     * @param fehlermeldung Text der Fehlermeldung
     */
    private async zeigeFehlerAlert( fehlermeldung: string ) {

        const alert = await this.alertCtrl.create({
            header: "Fehler",
            message: fehlermeldung,
            buttons: ["OK"]
          });

        await alert.present();
    }
}
