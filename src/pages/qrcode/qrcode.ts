import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { BarcodeScanner,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { PersonalServiceProvider } from '../../providers/personal-service/personal-service';
import { TostServiceProvider } from '../../providers/tost-service/tost-service';
import { TansectionServiceProvider } from '../../providers/tansection-service/tansection-service';
import { Tansection } from '../../models/tansection';
import { Personal } from '../../models/Presonal';
import { NotificationProvider } from '../../providers/notification/notification';
import { LoadingServiceProvider } from '../../providers/loading-service/loading-service';

@IonicPage()
@Component({
  selector: 'page-qrcode',
  templateUrl: 'qrcode.html',
})
export class QrcodePage {

  option : BarcodeScannerOptions;
  results: {};
  uidApprove:string;
  tansection:Tansection;
  personalRequest:Personal;
  personalApprove:Personal;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner,
    private afAuth: AngularFireAuth,
    private PersonalService:PersonalServiceProvider,
    public Tost:TostServiceProvider,
    public app:App,
    private tansectionService:TansectionServiceProvider,
    private notification:NotificationProvider,
    public loading:LoadingServiceProvider,
    public platform: Platform, 
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QrcodePage');
  }

  async scan(){
    if (this.platform.is('cordova')) {
      this.option = {prompt: 'Scan barcode'};
      await this.barcodeScanner.scan(this.option).then(res=>{
        this.results  = res;
        this.uidApprove = res.text;
        //let encode = btoa(this.uidApprove);
        //this.Tost.presentToast(this.uidApprove);
        this.requestTansection(this.uidApprove);
        
      });
    }else{
      this.Tost.showToastWithCloseButton('This function is only for mobile.');
    } 
    
  }

  async endCode(){
    let uid = localStorage.getItem('UID');
    //let endcode = atob(uid);
    if (this.platform.is('cordova')) {
      const results = await this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE,uid);
    }else{
      this.Tost.showToastWithCloseButton('This function is only for mobile.');
    }
    
  }

  requestTansection(uid_approve:string){
    try {
        let uid = localStorage.getItem('UID');
        this.PersonalService.getPersonal(uid).subscribe(requst=>{
          this.personalRequest = requst;
        });
        this.PersonalService.getPersonal(uid_approve).subscribe(approve=>{
          this.personalApprove = approve;
        });
        this.tansection = new Tansection
        ( '0000',
          '',
          this.personalRequest.uid,
          this.personalRequest,
          this.personalApprove.uid,
          this.personalApprove,
          'Wait'
        );//Wait, Allowed, Disallow
        this.tansectionService.requestTansection(this.tansection).then(resul=>{ 
          let detail = this.tansection.personal_request.firstName+' RequestTansection';
          this.tansectionService.sendNotificetionTo(this.tansection.personal_request.token,'Request',detail).then(res=>{
            //this.Tost.presentToast('request Sucess'+resul);
            this.loading.presentLoading(3000,'Request Sucess...');
            this.navCtrl.setRoot('TansectionsPage'); 
            const root = this.app.getRootNav();
                  root.popToRoot();
          })
        });
      
    } catch (error) {
      // this.Tost.presentToast('request error'+error);
      this.loading.presentLoading(3000,'Request Error...');
      this.navCtrl.setRoot('QrcodePage');
      const root = this.app.getRootNav();
                  root.popToRoot();
      
    }
    
  }

}
