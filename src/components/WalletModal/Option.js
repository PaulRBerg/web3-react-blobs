import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import typy from "typy";

import { GreenCircle, Link, colors } from "@sablier/theme";
import { transparentize } from "polished";

const Wrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  background-color: ${props => props.theme.white};
  border: 1px solid;
  border-color: ${props => props.theme.platinumGray};
  border-radius: 0.75rem;
  box-shadow: 0rem 0.25rem 0.5rem 0rem ${props => transparentize(0.95, props.theme.bleuDeFranceBlue)};
  justify-content: space-between;
  margin-top: 0rem;
  opacity: ${props => (props.isDisabled ? "0.5" : "1")};
  outline: none;
  padding: 1rem;
  transition: border-color 150ms ease-in-out;
  width: 100% !important;

  &:focus {
    box-shadow: 0rem 0rem 0rem 1px ${props => props.theme.bleuDeFranceBlue};
  }

  ${props =>
    props.isActive &&
    css`
      background-color: ${props.theme.backgroundColor};
    `};

  ${props =>
    props.isClickable &&
    css`
      &:active,
      &:hover {
        border-color: ${props.theme.blueJeansBlue};
        cursor: pointer;
      }
    `};
`;

const LabelWrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  height: 100%;
  justify-content: center;
`;

const TitleWrapper = styled.div`
  ${props => props.theme.flexRowNoWrap};
  align-items: center;
  margin-left: 0.125rem;
`;

const TitleLabel = styled.span`
  font-size: 1.0625rem;
  font-weight: 500;
  margin-left: 0rem;

  ${props => props.theme.mediaWidth.upToMedium`
    font-size: 0.9375rem;
  `};

  ${props =>
    props.isActive &&
    css`
      margin-left: 0.4375rem;
    `}
`;

const SubtitleLabel = styled.span`
  ${props => props.theme.flexRowNoWrap};
  color: ${props => props.theme.darkGunmetalBlack};
  font-family: ${props => props.theme.fallbackFont};
  font-size: 0.75rem;
  margin-top: 0.375rem;

  ${props => props.theme.mediaWidth.upToMedium`
    font-size: 0.675rem;
  `};
`;

const IconWrapper = styled.div`
  ${props => props.theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;

  & > img,
  span {
    height: ${props => props.size + "rem"};
    width: ${props => props.size + "rem"};
  }

  ${props => props.theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

function Option({ color, icon, iconSize, isActive, isClickable, link, onClick, subtitle, title }) {
  const content = (
    <Wrapper isActive={isActive} onClick={onClick} isClickable={isClickable && !isActive}>
      <LabelWrapper>
        <TitleWrapper>
          {isActive ? <GreenCircle /> : ""}
          <TitleLabel color={color} isActive={isActive}>
            {title}
          </TitleLabel>
        </TitleWrapper>
        {typy(subtitle).isTruthy && <SubtitleLabel>{subtitle}</SubtitleLabel>}
      </LabelWrapper>
      <IconWrapper isActive={isActive} size={iconSize}>
        <img src={icon} alt="Icon" />
      </IconWrapper>
    </Wrapper>
  );

  if (typy(link).isTruthy) {
    return <Link href={link}>{content}</Link>;
  } else {
    return content;
  }
}

Option.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  isClickable: PropTypes.bool,
  link: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.number,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

Option.defaultProps = {
  color: colors.bleuDeFranceBlue,
  link: null,
  iconSize: 1.75,
  isActive: false,
  isClickable: true,
  onClick: () => {},
  subtitle: null,
  title: null,
};

export default Option;
