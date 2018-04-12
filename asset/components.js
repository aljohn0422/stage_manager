let socket = io.connect(':5000');

new Vue({
    el: '#textBox',
    data: {
        ip: '',
        tabs: [],
        index: 0,
    },
    methods: {
        addTab() {
            this.tabs.push({
                title: 'untitled',
                content: ''
            })
            this.index = this.tabs.length - 1;
            socket.emit('client_send', JSON.stringify(this.tabs));
        },
        closeTab(index) {
            if (this.index == 0) {
                this.index = 0;
            } else if (this.index >= index) {
                this.index -= 1;
            }
            this.tabs.splice(index, 1);
            socket.emit('client_send', JSON.stringify(this.tabs));
        },
        select(index) {
            if (index != -1) {
                this.index = index;
            }
        },
        rename(e) {
            if (e) e.preventDefault();
            let newName = prompt('請輸入新標題：');
            if (newName) {
                this.tabs[this.index].title = newName;
            }
            socket.emit('client_send', JSON.stringify(this.tabs));
        },
        write() {
            socket.emit('client_send', JSON.stringify(this.tabs));
        },
    },
    mounted() {
        socket.on('load', data => {
            this.tabs = JSON.parse(data);
        })
        socket.on('ip', data => {
            this.ip = data;
        })
        socket.on('server_send', data => {
            data = JSON.parse(data);
            if (data.length == 1) {
                this.index = 0;
            } else if (data.length - 1 < this.index) {
                this.index -= 1;
            }
            this.tabs = data;
        })
    },
})

new Vue({
    el: '#timer',
    data: {
        current: '',
        past: '',
        buttons: [{
            text: '內場',
            choose: false
        }, {
            text: '回授',
            choose: false
        }]
    },
    methods: {
        update() {
            this.current = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: "numeric",
                minute: "numeric",
                second: 'numeric'
            });
        },
        add() {
            let optName = prompt('請輸入按鈕文字：');
            if (optName) {
                this.buttons.push({ text: optName, choose: false });
                socket.emit('option_send', JSON.stringify(this.buttons));
            }
        },
        close(index) {
            this.buttons.splice(index, 1)
            socket.emit('option_send', JSON.stringify(this.buttons));
        },
        select(index) {
            this.buttons[index].choose = !this.buttons[index].choose;
            socket.emit('option_send', JSON.stringify(this.buttons));
        }
    },
    created() {
        this.update();
        setInterval(() => this.update(), 1000)
    },
    mounted() {
        socket.on('server_send_option', data => {
            data = JSON.parse(data);
            this.buttons = data;
        })
        socket.on('load_options', data => {
            this.buttons = JSON.parse(data);
        })
    }
})