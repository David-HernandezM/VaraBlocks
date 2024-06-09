import { AlertContainerFactory, withoutCommas } from '@gear-js/react-hooks';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ACCOUNT_ID_LOCAL_STORAGE_KEY } from '@/app/consts';
import { HexString } from '@polkadot/util/types';
import { GasInfo } from '@gear-js/api';
// import { Keyring } from '@polkadot/api';
import { 
  BlockType,
  // ContractEnum,
  ContractEnumInterface,
  // ContractStruct,
  MetadataTypes,
  SendMessage,
  SendReply,
  Variable,
  VirtualContractStateType,
  // StructStringFormat,
  VirtualContractTypes
} from './app_types/types';
import { VaraBlockCodeBlock, VaraBlockEnum } from './SliceReducers';

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Set value in seconds
export const sleep = (s: number) => new Promise((resolve) => setTimeout(resolve, s * 1000));

export const copyToClipboard = async ({
  alert,
  value,
  successfulText,
}: {
  alert?: AlertContainerFactory;
  value: string;
  successfulText?: string;
}) => {
  const onSuccess = () => {
    if (alert) {
      alert.success(successfulText || 'Copied');
    }
  };
  const onError = () => {
    if (alert) {
      alert.error('Copy error');
    }
  };

  function unsecuredCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch (err) {
      console.error('Unable to copy to clipboard', err);
      onError();
    }
    document.body.removeChild(textArea);
  }

  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard
      .writeText(value)
      .then(() => onSuccess())
      .catch(() => onError());
  } else {
    unsecuredCopyToClipboard(value);
  }
};

export const isLoggedIn = ({ address }: InjectedAccountWithMeta) =>
  localStorage.getItem(ACCOUNT_ID_LOCAL_STORAGE_KEY) === address;

export function prettyDate(
  input: number | Date | string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'short',
    hourCycle: 'h23',
  },
  locale: string = 'en-US',
) {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function trimEndSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const prettyAddress = (address: HexString) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

export function toNumber(value: string) {
  return +withoutCommas(value);
}

// Added 10% on the gas spended
export const gasToSpend = (gasInfo: GasInfo): bigint => {
  const gasHuman = gasInfo.toHuman();
  const minLimit = gasHuman.min_limit?.toString() ?? "0";
  const parsedGas = Number(minLimit.replaceAll(',', ''));
  const gasPlusTenPorcent = Math.round(parsedGas + parsedGas * 0.10);
  const gasLimit: bigint = BigInt(gasPlusTenPorcent);
  return gasLimit;
}

export const sleepReact = (ms: number) => new Promise(r => setTimeout(r, ms));

export const generatePassword = (): string => {
  var length = 30,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export const generateRandomString = (length: number) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let  retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export const virtualContractTypeToString = (virtualContractType: VirtualContractTypes): string => {
  return Object.keys(virtualContractType)[0];
}

// export const virtualContractEnumToString = (contractEnum: ContractEnum): 

// export const virtualContractStructToStringArray = (contractStruct: ContractStruct): StructStringFormat => {
//   const structData = [contractStruct.structName];

// }

export const metadataHasOut = (metadata: MetadataTypes): string | null => {
  const types = Object.keys(metadata)[0];

  switch (types) {
    case 'Out':
      const inData = metadata as { Out: [string] };
      return inData.Out[0];
    case 'InOut':
      const inOutData = metadata as { InOut: [string, string] };
      return inOutData.InOut[1];
    default:
      return null;
  }
}

export const metadataHasIn = (metadata: MetadataTypes): string | null => {
  const types = Object.keys(metadata)[0];

  switch (types) {
    case 'In':
      const inData = metadata as { In: [string] };
      return inData.In[0];
    case 'InOut':
      const inOutData = metadata as { InOut: [string, string] };
      return inOutData.InOut[0];
    default:
      return null;
  }
}

export const firstVariantFromEnumI = (enumData: ContractEnumInterface): string | null => {
  console.log('Se recibio:');
  console.log(enumData);
  console.log('Las variantes de lo que se recibio:');
  console.log(enumData.variants);
  
  
  for (const [_enumKey, enumVariantName] of Object.entries(enumData.variants)) {
    console.log('Lo que se procesara');
    console.log(enumVariantName);
    
    if (enumVariantName.trim() === '') continue;
    return enumVariantName;
  }

  return null;

  // for (const [variantId, variantName] in enumData.variants) {
  //   const variantName = Object.values(variantData)[0];
  //   console.log('Variant data:');
    
  //   console.log(variantData);
    
  //   console.log('Variant name get: ', variantName);
  //   if (variantName.trim() === '') continue;
  //   return variantName;
  // }
  // return null;
}


export const enumDataByName = (enumName: string, enumsData: VaraBlockEnum): ContractEnumInterface | null => {
  const enumData = Object.entries(enumsData).find(([_, enumData]) => enumData.enumName === enumName);
  if (enumData) {
      return enumData[1];
  } else {
      return null;
  }
}

export const separateInitAndHandleBlocks = (blocks: VaraBlockCodeBlock, blockType: BlockType): [VaraBlockCodeBlock, VaraBlockCodeBlock] => {
  const initBlocks: VaraBlockCodeBlock = {};
  const handleBlocks: VaraBlockCodeBlock = {};
  switch (blockType) {
    case 'loadmessage':
      Object.entries(blocks).forEach(([blockId, block]) => {
        const blockData = block as { LoadMessageI: { data: Variable, loadInInit: boolean } };
        if (blockData.LoadMessageI.loadInInit) initBlocks[blockId] = block;
        else handleBlocks[blockId] = block;
      })
      break;
    case 'sendmessage':
      Object.entries(blocks).forEach(([blockId, block]) => {
        const blockData = block as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } };
        if (blockData.SendMessageI.sendMessageInInit) initBlocks[blockId] = block;
        else handleBlocks[blockId] = block;
      })
      break;
    case 'replymessage':
      Object.entries(blocks).forEach(([blockId, block]) => {
        const blockData = block as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } };
        if (blockData.SendReplyI.sendReplyInInit) initBlocks[blockId] = block;
        else handleBlocks[blockId] = block;
      })
      break;
    default:
      console.log('NO SE SEPARO NADAAAAA');
      break;
  }

  return [initBlocks, handleBlocks];
}

export const formatMetadata = (metadataType: MetadataTypes): [string, string] => {
  const mType = Object.keys(metadataType)[0];

  switch (mType) {
      case 'In':
          const metadataTypeValueIn = metadataType as { In: [string] };
          return [metadataTypeValueIn.In[0], 'NoValue'];
      case 'Out':
          const metadataTypeValueOut = metadataType as { Out: [string] };
          return ['NoValue', metadataTypeValueOut.Out[0]];
      case 'InOut':
          const metadataTypeValueInOut = metadataType as { InOut: [string, string] };
          return [metadataTypeValueInOut.InOut[0], metadataTypeValueInOut.InOut[1]];
      default:
          return ['NoValue', 'NoValue'];
  }
}

export const formatStateType = (stateType: VirtualContractStateType): string => {
  if (!stateType) return 'NoState';

  return stateType[0];
}

