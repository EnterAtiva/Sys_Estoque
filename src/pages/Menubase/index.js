import './menubase.css';
import { useState, useEffect } from 'react';
import Principal from '../../components/Menus/Principal';
import Cadastro from '../../components/Menus/Cadastro';
import Movimento from '../../components/Menus/Movimento';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import { RiArrowLeftRightFill, RiArticleFill, RiAlignJustify } from 'react-icons/ri';
import { Link, useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';
//import firebase from '../../services/firebaseConnection';
//import Modal from '../../components/Modal';


export default function Menubase() {
  const { tela0 } = useParams();
  const { tela1 } = useParams();
  const { tela2 } = useParams();
  const history = useHistory();
  //alert("Tela 1: ", tela1);
  //console.log("Tela 0: ", tela0);
  //console.log("Tela 1: ", tela1);
  //console.log("Tela 2: ", tela2);

  if (tela0 === "principal") {
    //console.log("principal");
    return (
      <div>
        <Principal />
        <div className="content">
          <h1>Mancini & Trindade</h1>
          <Title name="Menus">
            <RiAlignJustify size={25} />
          </Title>
          <div className="container dashboard">
            <span>...</span>
          </div>
        </div>
      </div>
    )
  } else if (tela0 == "cadastro") {
    //console.log("cadastro");
    return (
      <div>
        <Cadastro />
        <div className="content">
        <h1>Mancini & Trindade</h1>
          <Title name="Menus de cadastros">
            <RiArticleFill size={25} />
          </Title>

          <div className="container dashboard">
            <span>...</span>
          </div>
        </div>
      </div>
    )
  } else if (tela0 == "movimento") {
    //console.log("movimento");
    return (
      <div>
        <Movimento />
        <div className="content">
        <h1>Mancini & Trindade</h1>
          <Title name="Movimentação dos produtos">
            <RiArrowLeftRightFill size={25} />
          </Title>
          <div className="container dashboard">
            <span>...</span>
          </div>
        </div>
      </div>
    )
  } else {
    //console.log("principal 2");
    return (
      <div>
        <Principal />
        <div className="content">
        <h1>Mancini & Trindade</h1>
          <Title name="Menus">
            <RiAlignJustify size={25} />
          </Title>
          <div className="container dashboard">
            <span>...</span>
          </div>
        </div>
      </div>
    )
  };

}
