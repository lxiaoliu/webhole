import React, {Component, PureComponent} from 'react';
import {AppSwitcher} from './infrastructure/widgets';
import {LoginForm, PostForm} from './UserAction';
import {TokenCtx} from './UserAction';
import {PromotionBar} from './Common';
import {ConfigUI} from './Config';

import './Title.css';

const flag_re=/^\/\/setflag ([a-zA-Z0-9_]+)=(.*)$/;

const HELP_TEXT=(
    <div className="box help-desc-box">
        <p>
            PKUHelper 网页版树洞 by @xmcp，
            基于&nbsp;
            <a href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html" target="_blank">GPLv3</a>
            &nbsp;协议在 <a href="https://github.com/pkuhelper-web/webhole" target="_blank">GitHub</a> 开源
        </p>
        <p>
            PKUHelper 网页版的诞生离不开&nbsp;
            <a href="https://reactjs.org/" target="_blank" rel="noopener">React</a>
            、
            <a href="https://icomoon.io/#icons" target="_blank" rel="noopener">IcoMoon</a>
            &nbsp;等开源项目
        </p>
        <p>
            This program is free software: you can redistribute it and/or modify
            it under the terms of the GNU General Public License as published by
            the Free Software Foundation, either version 3 of the License, or
            (at your option) any later version.
        </p>
        <p>
            This program is distributed in the hope that it will be useful,
            but WITHOUT ANY WARRANTY; without even the implied warranty of
            MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the&nbsp;
            <a href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html" target="_blank">GNU General Public License</a>
            &nbsp;for more details.
        </p>
    </div>
);

class ControlBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state={
            search_text: '',
        };
        this.set_mode=props.set_mode;

        this.on_change_bound=this.on_change.bind(this);
        this.on_keypress_bound=this.on_keypress.bind(this);
        this.do_refresh_bound=this.do_refresh.bind(this);
        this.do_attention_bound=this.do_attention.bind(this);
    }

    componentDidMount() {
        if(window.location.hash) {
            let text=decodeURIComponent(window.location.hash).substr(1);
            if(text.lastIndexOf('?')!==-1)
                text=text.substr(0,text.lastIndexOf('?')); // fuck wechat '#param?nsukey=...'
            this.setState({
                search_text: text,
            }, ()=>{
                this.on_keypress({key: 'Enter'});
            });
        }
    }

    on_change(event) {
        this.setState({
            search_text: event.target.value,
        });
    }

    on_keypress(event) {
        if(event.key==='Enter') {
            let flag_res=flag_re.exec(this.state.search_text);
            if(flag_res) {
                if(flag_res[2]) {
                    localStorage[flag_res[1]]=flag_res[2];
                    alert('Set Flag '+flag_res[1]+'='+flag_res[2]+'\nYou may need to refresh this webpage.');
                } else {
                    delete localStorage[flag_res[1]];
                    alert('Clear Flag '+flag_res[1]+'\nYou may need to refresh this webpage.');
                }
                return;
            }

            const mode=this.state.search_text.startsWith('#') ? 'single' : 'search';
            this.set_mode(mode,this.state.search_text||'');
        }
    }

    do_refresh() {
        window.scrollTo(0,0);
        this.setState({
            search_text: '',
        });
        this.set_mode('list',null);
    }

    do_attention() {
        window.scrollTo(0,0);
        this.setState({
            search_text: '',
        });
        this.set_mode('attention',null);
    }

    render() {
        return (
            <TokenCtx.Consumer>{({value: token})=>(
                <div className="control-bar">
                    <a className="control-btn" onClick={this.do_refresh_bound}>
                        <span className="icon icon-refresh" />
                    </a>
                    {!!token &&
                        <a className="control-btn" onClick={this.do_attention_bound}>
                            <span className="icon icon-attention" />
                        </a>
                    }
                    <input className="control-search" value={this.state.search_text} placeholder="搜索 或 #PID"
                           onChange={this.on_change_bound} onKeyPress={this.on_keypress_bound}
                    />
                    <a className="control-btn" onClick={()=>{
                        this.props.show_sidebar(
                            'P大树洞',
                            <div>
                                <PromotionBar />
                                <LoginForm show_sidebar={this.props.show_sidebar} />
                                <div className="box list-menu">
                                    <a onClick={()=>{this.props.show_sidebar(
                                        '设置',
                                        <ConfigUI />
                                    )}}>树洞网页版设置</a>
                                    &nbsp;/&nbsp;
                                    <a href="http://pkuhelper.pku.edu.cn/treehole_rules.html" target="_blank">树洞规范</a>
                                    &nbsp;/&nbsp;
                                    <a href="https://github.com/pkuhelper-web/webhole/issues" target="_blank">意见反馈 <span className="icon icon-github" /></a>
                                </div>
                                {HELP_TEXT}
                            </div>
                        )
                    }}>
                        <span className={'icon icon-'+(token ? 'about' : 'login')} />
                    </a>
                    {!!token &&
                        <a className="control-btn" onClick={()=>{
                            this.props.show_sidebar(
                                '发表树洞',
                                <PostForm token={token} on_complete={()=>{
                                    this.props.show_sidebar(null,null);
                                    this.do_refresh();
                                }} />
                            )
                        }}>
                            <span className="icon icon-plus" />
                        </a>
                    }
                </div>
            )}</TokenCtx.Consumer>
        )
    }
}

export function Title(props) {
    return (
        <div className="title-bar">
            <AppSwitcher appid="hole" />
            <div className="aux-margin">
                <div className="title">
                    <p className="centered-line">
                        P大树洞
                    </p>
                </div>
                <ControlBar show_sidebar={props.show_sidebar} set_mode={props.set_mode} />
            </div>
        </div>
    )
}