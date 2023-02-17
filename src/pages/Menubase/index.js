import './menubase.css';
import { useState, useEffect } from 'react';
import Principal from '../../components/Menus/Principal';
import Title from '../../components/Title';
import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import { RiArrowLeftRightFill, RiArticleFill, RiAlignJustify } from 'react-icons/ri';
import { Link, useHistory, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import fundo from '../../assets/fundo4.jpg';


export default function Menubase() {

    return (
      <div>
        <Principal />
        <div className="content">
          <h1 className="cont">Mancini & Trindade</h1>
          <Title name="Menus">
            <RiAlignJustify size={25} />
          </Title>
 
          <div className="abertura">
            <img className="aber" src={fundo} />
          </div>

        </div>
      </div>
    )

}
