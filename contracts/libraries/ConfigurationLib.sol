pragma solidity ^0.8.0;

library ConfigurationLib  {
    struct Configuration {
        uint32 startPeriodTime;
    }

    event SetConfig(uint32 startPeriodTime);

    function setConfiguration (
        Configuration storage configuration,
        uint32 startPeriodTime
    ) internal {
        configuration.startPeriodTime = startPeriodTime;
        emit SetConfig(startPeriodTime);
    }
}