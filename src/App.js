import React, {Component} from 'react';
import {Flow} from './Flows';
import {Title} from './Title';
import {Sidebar} from './Sidebar';
import {PressureHelper} from './PressureHelper';
import {TokenCtx,ISOP_APPKEY} from './UserAction';
import {load_config,bgimg_style} from './Config';

function DeprecatedAlert(props) {
    if(document.domain==='hole.xmcp.ml')
        return (
            <div className="flow-item">
                <div className="box box-tip">
                    <p><b>请使用新域名访问P大树洞！</b></p>
                    <p><a href="http://pkuhelper.pku.edu.cn/hole/">pkuhelper.pku.edu.cn/hole</a></p>
                    <p>当前域名将停止支持</p>
                </div>
            </div>
        );
    return null;
}

class App extends Component {
    constructor(props) {
        super(props);
        load_config();
        this.state={
            sidebar_title: null,
            sidebar_content: null, // determine status of sidebar
            mode: 'list', // list, single, search, attention
            search_text: null,
            flow_render_key: +new Date(),
            token: localStorage['TOKEN']||null,
        };
        this.show_sidebar_bound=this.show_sidebar.bind(this);
        this.set_mode_bound=this.set_mode.bind(this);
        this.on_pressure_bound=this.on_pressure.bind(this);
        // a silly self-deceptive approach to ban guests, enough to fool those muggles
        //                     document             cookie                    'pku_ip_flag=yes'
        this.inpku_flag=window[atob('ZG9jdW1lbnQ')][atob('Y29va2ll')].indexOf(atob('cGt1X2lwX2ZsYWc9eWVz'))!==-1;
    }

    on_pressure() {
        if(this.state.sidebar_title!==null)
            this.setState((prevState)=>({
                sidebar_title: null,
                sidebar_content: prevState.sidebar_content,
            }));
        else
            this.set_mode('list',null);
    }

    show_sidebar(title,content) {
        this.setState({
            sidebar_title: title,
            sidebar_content: content,
        });
    }

    set_mode(mode,search_text) {
        this.setState({
            mode: mode,
            search_text: search_text,
            flow_render_key: +new Date(),
        });
    }

    render() {
        return (
            <TokenCtx.Provider value={{
                value: this.state.token,
                set_value: (x)=>{
                    localStorage['TOKEN']=x||'';
                    this.setState({
                        token: x,
                    });
                },
            }}>
                <PressureHelper callback={this.on_pressure_bound} />
                <div className="bg-img" style={bgimg_style()} />
                <Title show_sidebar={this.show_sidebar_bound} set_mode={this.set_mode_bound} />
                <TokenCtx.Consumer>{(token)=>(
                    <div className="left-container">
                        <DeprecatedAlert token={token.value} />
                        {!token.value &&
                            <div className="flow-item-row aux-margin">
                                <div className="box box-tip">
                                    <p>点击右上角的 <span className="icon icon-login" /> 按钮登录</p>
                                </div>
                            </div>
                        }
                        {this.inpku_flag||token.value ?
                            <Flow key={this.state.flow_render_key} show_sidebar={this.show_sidebar_bound}
                                  mode={this.state.mode} search_text={this.state.search_text} token={token.value}
                            /> :
                            <div className="flow-item-row aux-margin">
                                <div className="box box-tip">
                                    <p>本网站仅限校内用户使用，请登录后访问。</p>
                                </div>
                            </div>
                        }
                        <br />
                    </div>
                )}</TokenCtx.Consumer>
                <Sidebar do_close={()=>{
                    this.setState({
                        sidebar_title: null,
                        sidebar_content: null,
                    });
                }} content={this.state.sidebar_content} title={this.state.sidebar_title} />
            </TokenCtx.Provider>
        );
    }
}

export default App;
