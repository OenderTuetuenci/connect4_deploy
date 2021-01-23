let buttons = []
for(let i = 0;i<7;i++){
    buttons.push({text:i,func:"draw("+i+")"})
}
Vue.component('buttons', {
    template:`
        <div class="row">
            <div v-for="item in text" class="col">
                <a class = "btn btn-danger" v-bind:onClick=item.func>{{item.text}}</a>
            </div>
        </div>
    `,
    data:function (){
        return {
            text: buttons
        }
    }
})
$(document).ready(function(){
    let butt = new Vue({
        el:'#buttons',
        data: {
            text: buttons
        }
    })
    // noinspection JSUnusedLocalSymbols
    var app = new Vue({
            el: '#app',
            data: {
                name: '',
                welcome: 'Wilkommen, bitte gib deinen Namen ein: '
            },
            methods:{
                submit:function(){
                    $("#eingabe").hide();
                    this.welcome= 'Wilkommen ' + this.name;
                }
            }

        }
    )
})