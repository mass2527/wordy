import { Box } from './components/Box';
import { Flex } from './components/Flex';
import { Switch } from './components/Switch';
import { Text } from './components/Text';

function Popup() {
  return (
    <Box css={{ width: '22rem' }}>
      <Flex
        as='header'
        gap={8}
        align='center'
        css={{ p: '$16', borderBottom: '1px solid $neutral200' }}
      >
        <img src="icon16.png" alt="wordy logo" width={24} height={24} />
        <Text as='h1'>
          wordy{' '}
          <Text color='primary' css={{ fontWeight: '$700' }}>
            for Chrome
          </Text>
        </Text>
      </Flex>
      <Flex as='main' direction='column' gap={8} css={{ p: '$16' }}>
        <Text as='h2' css={{ fontWeight: '$700' }}>
          설정
        </Text>
        <Flex justify='between' align='center'>
          <Text size={14}>활성화</Text>
          <Switch />
        </Flex>
        <Flex justify='between' align='center'>
          <Text size={14}>발음기호 및 발음 정보 표시</Text>
          <Switch />
        </Flex>
      </Flex>
    </Box>
  );
}

export default Popup;
