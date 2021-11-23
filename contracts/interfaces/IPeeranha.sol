pragma solidity >=0.5.0;
pragma abicoder v2;

import './IPeeranhaForum.sol';
import './IPeeranhaUser.sol';
import './IPeeranhaPost.sol';

interface IPeeranha is IPeeranhaForum, IPeeranhaUser, IPeeranhaPost {
  function getRatingToReward(address user, uint16 rewardPeriod) external view returns(int32);
}