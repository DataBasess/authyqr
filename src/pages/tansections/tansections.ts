import { Component } from '@angular/core';
import { App,IonicPage, NavController, NavParams } from 'ionic-angular';
import { TostServiceProvider } from '../../providers/tost-service/tost-service';
import { AngularFireAuth } from 'angularfire2/auth';
import { TansectionServiceProvider } from '../../providers/tansection-service/tansection-service';
import { Tansection } from '../../models/tansection';
import { PersonalServiceProvider } from '../../providers/personal-service/personal-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Blockchain } from '../../models/blockchain';
import { LoadingServiceProvider } from '../../providers/loading-service/loading-service';

/**
 * Generated class for the TansectionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tansections',
  templateUrl: 'tansections.html',
})
export class TansectionsPage {

  friends: string = "add";
  tansection:Tansection;
  tansectionsRequest:Tansection[];
  tansectionsApprove:Tansection[];
  blockchain:Blockchain;
  bloclNumber:number;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public app:App,
    private Auth:AngularFireAuth,
    public Tost:TostServiceProvider,
    private tansectionService:TansectionServiceProvider,
    private PersonalService:PersonalServiceProvider,
    private blockchainService:BlockchainServiceProvider,
    public loading:LoadingServiceProvider
  ) {

    // this.blockchainService.resetBlock();
    // this.blockchainService.checkBlock();

    this.blockchainService.blockNow().subscribe(block=>{
      console.log('blockNow+++++++++++++',block.$value);      
      this.bloclNumber = block.$value;
    })

    

    let uid = localStorage.getItem('UID');
    console.log('uid',uid);

    // this.tansectionService.sendNotificetionTo('hSEwmmeDTzNQnrH0VWstw7wnf1s2','Hello',"ok").then(res=>{
    //   console.log('sendNotificetionTo',res);
    // })   
    
    
    if(uid){
      this.tansectionService.getListTansectionRequest(uid).subscribe(tansec=>{
        console.log('tansecRequest',tansec);
        this.tansectionsRequest = tansec;      
      });
          
      this.tansectionService.getListTansectionApprove(uid).subscribe(tansec=>{
          console.log('tansecApprove',tansec);
          this.tansectionsApprove = tansec;
      });
    }
    
    
  } 

  approveTansection(tansection:Tansection){
    //console.log(tansection);
    this.blockchainService.blockNow().subscribe(block=>{
      console.log('blockNow+++++++++++++',block.$value);      
      this.bloclNumber = block.$value;
    });

    let time_stamp = new Date().toTimeString();
    
    this.tansection = new Tansection(
      this.bloclNumber.toString(),
      time_stamp,
      tansection.uid_request,
      tansection.personal_request,
      tansection.uid_approve,
      tansection.personal_approve,
      'Allowed'
    );
    console.log(this.tansection);
    
    
    
    //Wait, Allowed, Disallow
    this.tansectionService.approveTansection(tansection.$key,this.tansection).then(res=>{

        this.blockchainService.commitTansection(this.bloclNumber.toString(),this.tansection);
        this.tansectionService.sendNotificetionTo(tansection.personal_request.token,'Transection Approve','Form'+tansection.personal_approve.firstName).then(res=>{
          console.log(" QR sendNotificetionTo",res);          
        });     
        this.loading.presentLoading(3000,'Approve Tansection Sucess...');
    }).catch(e=>{
        this.loading.presentLoading(3000,'Approve Tansection Sucess...');
    })
    
  }

  rejectTansection(tansection:Tansection){
    console.log('get',tansection);
    //console.log('get',tansection.$key);
    this.tansection = new Tansection(
      '0000',
      '',
      tansection.uid_request,
      tansection.personal_request,
      tansection.uid_approve,
      tansection.personal_approve,
      'Disallow'
    );
    console.log(this.tansection);
    this.tansectionService.rejectTansection(tansection.$key,this.tansection).then(result=>{
      this.Tost.presentToast('Sucess :'+result);
      this.tansectionService.sendNotificetionTo(tansection.personal_request.token,'Transection Reject','Form'+tansection.personal_approve.firstName).then(res=>{
        console.log(" QR sendNotificetionTo",res);          
      });
      this.loading.presentLoading(3000,'Reject Tansection Sucess...');
    }).catch(error=>{
      this.Tost.presentToast('Error :'+error);
      this.loading.presentLoading(3000,'Reject Tansection Error...');
    });
  }

  viewTansection(tansection:Tansection){
    console.log(tansection);
    this.navCtrl.push('ViewTansectionPage');
    //this.navParams.   
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TansectionsPage');
  }

  logOut(){
    this.Auth.auth.signOut().then(result=>{
        console.log('pass',result);
        localStorage.clear();
        this.navCtrl.setRoot('LoginPage');    
        const root = this.app.getRootNav();
              root.popToRoot();
        
    }).catch(error=>{
      console.log('error',error);
    })
   
  }

  inputRequest:string="";
  filterRequest(event){
    console.log('filter',event);
    if(event!=""){
      let arr = this.tansectionsRequest.filter(obj => obj.personal_request.firstName === this.inputRequest); 
      this.tansectionsRequest = arr;
      console.log(arr);
      
    }else{
      let uid = localStorage.getItem('UID');
      this.tansectionService.getListTansectionRequest(uid).subscribe(tansec=>{
        console.log('tansecRequest',tansec);
        this.tansectionsRequest = tansec;      
      });
          
      // this.tansectionService.getListTansectionApprove(uid).subscribe(tansec=>{
      //     console.log('tansecApprove',tansec);
      //     this.tansectionsApprove = tansec;
      // });
    }    
       
  }

  inputApprove:string="";
  filterApprove(event){
    console.log(event);    
    //this.tansectionsApprove.find(obj => obj.personal_request.firstName == "")
  }

}
